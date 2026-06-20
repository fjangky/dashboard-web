const express = require('express');
const path = require('path');
const fs = require('fs');
const si = require('systeminformation');
const Docker = require('dockerode');
const { exec } = require('child_process');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const CONFIG_FILE = path.join(__dirname, 'config.json');

// --- Helper Functions ---
function readConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        return { 
            showCpu: true, showRam: true, showUptime: true, showTemp: true, 
            chartPoints: 20, lang: 'id', mainTitle: "Sistem Pusat Kendali", 
            hostTag: "STB-SERVER", dashboardPort: 3000 
        };
    }
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

function writeConfig(config) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Helper untuk menjalankan perintah terminal Linux (Promise-based)
function runCommand(cmd) {
    return new Promise((resolve) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                resolve('');
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

// Logika pemindaian otomatis seluruh aplikasi native berdasarkan Port jaringan terbuka
async function scanNativeServices() {
    // Mengambil port TCP/UDP yang sedang LISTEN beserta nama prosesnya
    // Memerlukan hak akses tinggi (sudo/root) untuk membaca segmen users:(("proses"))
    const stdout = await runCommand('sudo ss -tulpn | grep LISTEN');
    if (!stdout) return [];

    const lines = stdout.split('\n');
    const servicesMap = new Map();

    lines.forEach(line => {
        const portMatch = line.match(/:([0-9]+)\s+/);
        const processMatch = line.match(/users:\(\("([^"]+)"/);

        if (portMatch && processMatch) {
            const port = portMatch[1];
            let procName = processMatch[1];

            // Abaikan docker-proxy agar aplikasi di dalam Docker tidak masuk ke list native OS
            if (procName === 'docker-proxy') return;

            // Kelompokkan port jika berasal dari aplikasi/layanan native OS yang sama
            if (servicesMap.has(procName)) {
                const existing = servicesMap.get(procName);
                if (!existing.ports.includes(port)) {
                    existing.ports.push(port);
                }
            } else {
                servicesMap.set(procName, {
                    id: `PID-${Math.floor(Math.random() * 9000) + 1000}`,
                    name: procName.toUpperCase(),
                    image: "Native Linux Service",
                    ports: [port],
                    state: "running",
                    type: "system"
                });
            }
        }
    });

    // Ubah array kumpulan port menjadi format string (misal: "80, 443")
    return Array.from(servicesMap.values()).map(s => {
        s.ports = s.ports.join(', ');
        return s;
    });
}

// --- Init App ---
const config = readConfig();
const PORT = config.dashboardPort || 3000;
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoints ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));

app.get('/api/stats', async (req, res) => {
    try {
        const cpuTemp = await si.cpuTemperature();
        const currentTemp = (cpuTemp.main > 0) ? Math.round(cpuTemp.main) : 45;
        const diskData = await si.fsSize();
        const mainDisk = diskData[0];
        res.json({ 
            cpuUsage: Math.floor(Math.random() * 100), 
            ramUsage: Math.floor(Math.random() * 80), 
            uptime: Math.floor(process.uptime()), 
            temperature: currentTemp,
            diskUsage: {
                percent: mainDisk.use,
                used: (mainDisk.used / 1024 / 1024 / 1024).toFixed(1),
                total: (mainDisk.size / 1024 / 1024 / 1024).toFixed(1)
            }, 
            config: readConfig() 
        });
    } catch (e) { res.status(500).json({ error: "Gagal ambil stats" }); }
});

app.get('/api/settings', (req, res) => res.json({ config: readConfig() }));

app.post('/api/settings/config', (req, res) => {
    const newConfig = { ...req.body, dashboardPort: parseInt(req.body.dashboardPort) || 3000 };
    writeConfig(newConfig);
    res.json({ success: true, message: "Konfigurasi tersimpan. Merestart aplikasi..." });

    // Auto-restart sistem menggunakan PM2 agar port baru langsung aktif
    setTimeout(() => {
        exec('pm2 restart dashboard-stb', (err) => {
            if (err) console.log("Gagal auto-restart, pastikan PM2 terpasang.");
        });
    }, 1500);
});

app.get('/api/services', async (req, res) => {
    let systemServices = [];
    const dockerServices = [];

    // Fungsi deteksi aaPanel yang ditingkatkan (Membaca file port.pl)
    const checkAapanel = () => new Promise((resolve) => {
        const portFile = '/www/server/panel/data/port.pl';
        fs.readFile(portFile, 'utf8', (err, data) => {
            if (err) {
                // Fallback: Jika file tidak bisa dibaca, gunakan deteksi port umum
                exec("ss -tuln | grep -E '8888|81|82'", (err2, stdout) => {
                    systemServices.push({
                        id: "SYS-01", name: "aaPanel", image: "Native OS",
                        state: stdout ? "running" : "stopped",
                        ports: stdout ? "Detected" : "N/A", type: "system"
                    });
                    resolve();
                });
            } else {
                const port = data.trim();
                exec(`ss -tuln | grep :${port}`, (err3, stdout) => {
                    systemServices.push({
                        id: "SYS-01", name: "aaPanel", image: "Native OS",
                        state: stdout ? "running" : "stopped",
                        ports: port, type: "system"
                    });
                    resolve();
                });
            }
        });
    });

    try {
        // 1. Jalankan deteksi manual aaPanel bawaan Anda
        await checkAapanel();

        // 2. Jalankan deteksi otomatis aplikasi Native OS via Port Terbuka
        const autoNative = await scanNativeServices();
        
        // Gabungkan deteksi manual aaPanel dengan deteksi otomatis port (hindari nama ganda jika aaPanel terdeteksi kembali)
        autoNative.forEach(service => {
            if (service.name !== 'AAPANEL') {
                systemServices.push(service);
            }
        });

        // 3. Jalankan pemindaian otomatis Kontainer Docker via Dockerode
        const containers = await docker.listContainers({ all: true });
        containers.forEach(c => {
            const portMap = c.Ports.map(p => p.PublicPort ? `${p.PublicPort}:${p.PrivatePort}` : p.PrivatePort);
            dockerServices.push({ 
                id: c.Id.substring(0, 12), 
                name: c.Names[0].replace(/^\//, ''), 
                image: c.Image.startsWith('sha256:') ? 'Custom' : c.Image, 
                state: c.State, 
                ports: [...new Set(portMap)].join(', ') || 'No Port',
                type: "docker"
            });
        });

        res.json({ system: systemServices, docker: dockerServices });
    } catch (err) {
        res.json({ system: systemServices, docker: dockerServices });
    }
});

app.post('/api/containers/prune', async (req, res) => {
    try {
        const data = await docker.pruneContainers();
        res.json({ success: true, message: data.ContainersDeleted ? data.ContainersDeleted.length : 0 });
    } catch (err) { res.status(500).json({ success: false }); }
});

// --- Server Listener ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pusat Kendali berjalan di port: ${PORT}`);
});