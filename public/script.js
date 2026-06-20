// Konfigurasi awal
const ctx = document.getElementById('cpuChart') ? document.getElementById('cpuChart').getContext('2d') : null;
let maxChartPoints = 20;
let currentLang = 'id';

// Kamus Bahasa
const dictionary = {
    id: {
        cockpitBtn: '<i class="fa-solid fa-gear"></i> Pengaturan Sistem',
        chartTitle: '<i class="fa-solid fa-chart-line"></i> Grafik Beban Kerja',
        lblCpu: 'Beban CPU', lblRam: 'Penggunaan RAM',
        lblUptime: 'Waktu Aktif', lblTemp: 'Suhu',
        lblStorage: 'Penyimpanan',
        sysTitle: 'Layanan Armbian System',
        dockerTitle: 'Kontainer Docker',
        btnSave: 'Simpan Konfigurasi',
        rackEmpty: 'Tidak ada aplikasi aktif.'
    },
    en: {
        cockpitBtn: '<i class="fa-solid fa-gear"></i> System Settings',
        chartTitle: '<i class="fa-solid fa-chart-line"></i> Workload Stream',
        lblCpu: 'CPU Load', lblRam: 'RAM Usage',
        lblUptime: 'Uptime', lblTemp: 'Temp',
        lblStorage: 'Storage',
        sysTitle: 'Armbian System Services',
        dockerTitle: 'Docker Containers',
        btnSave: 'Save Configuration',
        rackEmpty: 'No active services.'
    }
};

// Inisialisasi Grafik
const cpuChart = ctx ? new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ data: [], borderColor: '#00ffcc', backgroundColor: 'rgba(0, 255, 204, 0.05)', fill: true, tension: 0.4 }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }
}) : null;

// Fungsi Utama: Mengambil Data Statistik
async function fetchData() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        
        // Update Kartu Statistik
        document.getElementById('cpu-text').innerHTML = `${data.cpuUsage}<span>%</span>`;
        document.getElementById('ram-text').innerHTML = `${data.ramUsage}<span>%</span>`;
        document.getElementById('temp-text').innerHTML = `${data.temperature}<span>°C</span>`;
        document.getElementById('uptime-text').innerHTML = `${Math.floor(data.uptime / 60)}<span>m</span>`;
        
        // Update Storage
        document.getElementById('disk-text').innerHTML = `${data.diskUsage.percent}<span>%</span>`;
        document.getElementById('disk-detail').innerText = `${data.diskUsage.used} / ${data.diskUsage.total} GB`;
        
        // Update Grafik
        const time = new Date().toLocaleTimeString();
        if (cpuChart.data.labels.length >= maxChartPoints) { 
            cpuChart.data.labels.shift(); cpuChart.data.datasets[0].data.shift(); 
        }
        cpuChart.data.labels.push(time); 
        cpuChart.data.datasets[0].data.push(data.cpuUsage); 
        cpuChart.update('none');
    } catch (e) { console.warn("Telemetri terputus."); }
}

// Fungsi Utama: Mengambil Data Layanan
async function updateContainersMonitor() {
    try {
        const res = await fetch('/api/services');
        const services = await res.json();
        const sysBox = document.getElementById('system-services-container');
        const dockerBox = document.getElementById('docker-services-container');
        
        sysBox.innerHTML = '';
        dockerBox.innerHTML = '';

        services.system.forEach(s => sysBox.innerHTML += createBladeHtml(s));
        services.docker.forEach(s => dockerBox.innerHTML += createBladeHtml(s));
    } catch (err) { console.error("Gagal sinkronisasi layanan."); }
}

// Render Komponen Blade
function createBladeHtml(s) {
    const isRunning = s.state === 'running';
    return `
        <div class="server-blade">
            <div class="blade-left">
                <div class="led ${isRunning ? 'led-active' : 'led-offline'}"></div>
                <div class="blade-details">
                    <h4>${s.name}</h4>
                    <p>${s.type === 'system' ? 'Native OS' : s.image}</p>
                </div>
            </div>
            <div class="blade-network"><i class="fa-solid fa-plug"></i> ${s.ports}</div>
        </div>`;
}

// Pengaturan Modal
async function toggleSettingsModal(show) {
    const modal = document.getElementById('settingsModal');
    if (show) {
        modal.classList.add('active');
        const res = await fetch('/api/settings');
        const data = await res.json();
        document.getElementById('set-dashboardPort').value = data.config.dashboardPort || 3000;
        document.getElementById('set-mainTitle').value = data.config.mainTitle || '';
    } else { modal.classList.remove('active'); }
}

// Event Handler: Simpan Konfigurasi
document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const configData = {
        dashboardPort: document.getElementById('set-dashboardPort').value,
        mainTitle: document.getElementById('set-mainTitle').value
    };
    const res = await fetch('/api/settings/config', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(configData) 
    });
    const result = await res.json();
    alert(result.message);
    toggleSettingsModal(false);
});

// Inisialisasi Interval
setInterval(fetchData, 5000);
setInterval(updateContainersMonitor, 10000);
fetchData();
updateContainersMonitor();