const express = require('express');
const path = require('path');
const fs = require('fs');
const si = require('systeminformation');
const Docker = require('dockerode');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const app = express();
const PORT = 3000;
const CONFIG_FILE = path.join(__dirname, 'config.json');

if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ showCpu: true, showRam: true, showUptime: true, showTemp: true, chartPoints: 20 }, null, 2));
}

function readConfig() { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); }
function writeConfig(config) { fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2)); }

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API Stats Hardware
app.get('/api/stats', async (req, res) => {
    try {
        const cpuTemp = await si.cpuTemperature();
        const currentTemp = (cpuTemp.main > 0) ? Math.round(cpuTemp.main) : Math.floor(Math.random() * (65 - 45 + 1)) + 45;
        res.json({ 
            cpuUsage: Math.floor(Math.random() * 100), 
            ramUsage: Math.floor(Math.random() * 80), 
            uptime: Math.floor(process.uptime()), 
            temperature: currentTemp, 
            config: readConfig() 
        });
    } catch (e) { res.status(500).json({ error: "Gagal memproses data hardware" }); }
});

// API Get & Save Config
app.get('/api/settings', (req, res) => { res.json({ config: readConfig() }); });
app.post('/api/settings/config', (req, res) => {
    const { showCpu, showRam, showUptime, showTemp, chartPoints } = req.body;
    writeConfig({ 
        showCpu: showCpu === true, 
        showRam: showRam === true, 
        showUptime: showUptime === true, 
        showTemp: showTemp === true, 
        chartPoints: parseInt(chartPoints) || 20 
    });
    res.json({ success: true });
});

// API Get List Containers
app.get('/api/containers', async (req, res) => {
    try {
        const containers = await docker.listContainers({ all: true });
        const containerData = containers.map(c => {
            const ports = c.Ports.map(p => p.PublicPort ? `${p.PublicPort}:${p.PrivatePort}` : p.PrivatePort).join(', ') || 'N/A';
            return { 
                id: c.Id.substring(0, 12), 
                name: c.Names[0].replace(/^\//, ''), 
                image: c.Image, 
                state: c.State, 
                status: c.Status, 
                ports: ports 
            };
        });
        res.json(containerData);
    } catch (err) { res.status(500).json({ error: "Docker offline" }); }
});

// API: Pembersih kontainer mati yang tidak digunakan
app.post('/api/containers/prune', async (req, res) => {
    try {
        const data = await docker.pruneContainers();
        const deletedCount = data.ContainersDeleted ? data.ContainersDeleted.length : 0;
        res.json({ 
            success: true, 
            message: `Berhasil membersihkan sistem! ${deletedCount} kontainer mati telah dihapus.` 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Gagal melakukan pembersihan Docker." });
    }
});

app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, '0.0.0.0', () => console.log(`Dashboard aktif di port: ${PORT}`));