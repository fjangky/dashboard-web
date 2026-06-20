const ctx = document.getElementById('cpuChart').getContext('2d');
let maxChartPoints = 20;
let currentLang = 'id';

// Kamus Multi-Bahasa
const dictionary = {
    id: {
        cockpitBtn: '<i class="fa-solid fa-terminal"></i> KOKPIT SIS',
        chartTitle: '<i class="fa-solid fa-chart-line"></i> ALIRAN TELEMETRI REAL-TIME',
        lblCpu: '<i class="fa-solid fa-microchip"></i> BEBAN INTI CPU',
        lblRam: '<i class="fa-solid fa-memory"></i> RAM VIRTUAL',
        lblUptime: '<i class="fa-solid fa-clock"></i> UPTIME NODE',
        lblTemp: '<i class="fa-solid fa-temperature-half"></i> SENSOR TERMAL',
        rackTitle: '<i class="fa-solid fa-server"></i> KABINET RAK KONTAINER MAINFRAME ($count BLADES)',
        purgeBtn: '<i class="fa-solid fa-broom"></i> SAPU BLADE MATI',
        modalTitle: '// KONFIGURASI SISTEM',
        secLang: 'BAHASA SISTEM',
        lblLang: 'PILIH BAHASA',
        secTele: 'MODUL TELEMETRI',
        optCpu: 'PANTAU STATUS CPU',
        optRam: 'PANTAU STATUS RAM',
        optUptime: 'PANTAU STATUS UPTIME',
        optTemp: 'PANTAU SENSOR TERMAL',
        optChart: 'TITIK REFRESH GRAFIK',
        btnSave: 'EKSEKUSI KONFIGURASI',
        rackEmpty: 'KOMPARTEMEN RAK KOSONG // TIDAK ADA BLADE AKTIF',
        confirmPurge: 'EKSEKUSI PEMBERSIHAN? Seluruh kontainer dengan status TERMINATED/EXITED akan dimusnahkan permanen.',
        msgSuccess: 'SISTEM BERSIH! $count kontainer mati berhasil dimusnahkan.',
        msgError: 'GAGAL melakukan pembersihan Docker.',
        msgCritical: 'KRITIKAL: Gagal terhubung ke modul inti server.'
    },
    en: {
        cockpitBtn: '<i class="fa-solid fa-terminal"></i> COCKPIT SYS',
        chartTitle: '<i class="fa-solid fa-chart-line"></i> REAL-TIME TELEMETRY STREAM',
        lblCpu: '<i class="fa-solid fa-microchip"></i> CPU CORE LOAD',
        lblRam: '<i class="fa-solid fa-memory"></i> VIRTUAL RAM',
        lblUptime: '<i class="fa-solid fa-clock"></i> NODE UPTIME',
        lblTemp: '<i class="fa-solid fa-temperature-half"></i> THERMAL SENSOR',
        rackTitle: '<i class="fa-solid fa-server"></i> MAINFRAME CONTAINER RACK CABINET ($count BLADES)',
        purgeBtn: '<i class="fa-solid fa-broom"></i> PURGE DEAD BLADES',
        modalTitle: '// SYSTEM CONFIG',
        secLang: 'SYSTEM LANGUAGE',
        lblLang: 'CHOOSE LANGUAGE',
        secTele: 'TELEMETRY MODULES',
        optCpu: 'MONITOR CPU STATUS',
        optRam: 'MONITOR RAM STATUS',
        optUptime: 'MONITOR UPTIME STATUS',
        optTemp: 'MONITOR THERMAL SENSOR',
        optChart: 'CHART REFRESH POINTS',
        btnSave: 'EXECUTE CONFIG',
        rackEmpty: 'RACK COMPARTMENT EMPTY // NO ACTIVE BLADES DETECTED',
        confirmPurge: 'EXECUTE PURGE ACTION? All containers with TERMINATED/EXITED status will be permanently destroyed.',
        msgSuccess: 'SYSTEM PURGED! $count dead containers successfully destroyed.',
        msgError: 'FAILED to perform Docker prune.',
        msgCritical: 'CRITICAL: Failed to connect to server core module.'
    }
};

function applyLanguage(lang, count = 0) {
    currentLang = lang;
    const l = dictionary[lang];
    
    document.getElementById('btn-cockpit').innerHTML = l.cockpitBtn;
    document.getElementById('txt-chart-title').innerHTML = l.chartTitle;
    document.getElementById('txt-lbl-cpu').innerHTML = l.lblCpu;
    document.getElementById('txt-lbl-ram').innerHTML = l.lblRam;
    document.getElementById('txt-lbl-uptime').innerHTML = l.lblUptime;
    document.getElementById('txt-lbl-temp').innerHTML = l.lblTemp;
    document.getElementById('txt-rack-title').innerHTML = l.rackTitle.replace('$count', count);
    document.getElementById('btn-purge').innerHTML = l.purgeBtn;
    
    document.getElementById('txt-modal-title').innerText = l.modalTitle;
    document.getElementById('txt-sec-lang').innerText = l.secLang;
    document.getElementById('txt-lbl-lang').innerText = l.lblLang;
    document.getElementById('txt-sec-tele').innerText = l.secTele;
    document.getElementById('txt-opt-cpu').innerText = l.optCpu;
    document.getElementById('txt-opt-ram').innerText = l.optRam;
    document.getElementById('txt-opt-uptime').innerText = l.optUptime;
    document.getElementById('txt-opt-temp').innerText = l.optTemp;
    document.getElementById('txt-opt-chart').innerText = l.optChart;
    document.getElementById('btn-save-config').innerText = l.btnSave;
}

// Chart Initial Setup
const cpuChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{ label: 'CPU', data: [], borderColor: '#00ffcc', backgroundColor: 'rgba(0, 255, 204, 0.02)', fill: true, tension: 0.3, borderWidth: 2, pointRadius: 0 }]
    },
    options: { 
        responsive: true, 
        plugins: { legend: { display: false } }, 
        scales: { 
            x: { display: false }, 
            y: { min: 0, max: 100, grid: { color: 'rgba(30, 41, 59, 0.3)' }, ticks: { color: '#00ffcc', font: { family: 'Share Tech Mono', size: 11 } } } 
        } 
    }
});

async function fetchData() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        document.getElementById('cpu-text').innerHTML = `${data.cpuUsage}<span>%</span>`;
        document.getElementById('ram-text').innerHTML = `${data.ramUsage}<span>%</span>`;
        document.getElementById('uptime-text').innerHTML = `${data.uptime}<span>s</span>`;
        document.getElementById('temp-text').innerHTML = `${data.temperature}<span>°C</span>`;
        
        document.getElementById('card-cpu').style.display = data.config.showCpu ? 'block' : 'none';
        document.getElementById('card-ram').style.display = data.config.showRam ? 'block' : 'none';
        document.getElementById('card-uptime').style.display = data.config.showUptime ? 'block' : 'none';
        document.getElementById('card-temp').style.display = data.config.showTemp ? 'block' : 'none';
        
        maxChartPoints = data.config.chartPoints;
        
        // Terapkan bahasa dari konfigurasi server
        const currentCount = document.getElementById('container-count').innerText || 0;
        applyLanguage(data.config.lang || 'id', currentCount);

        const time = new Date().toLocaleTimeString();
        while (cpuChart.data.labels.length >= maxChartPoints) {
            cpuChart.data.labels.shift();
            cpuChart.data.datasets[0].data.shift();
        }
        cpuChart.data.labels.push(time);
        cpuChart.data.datasets[0].data.push(data.cpuUsage);
        cpuChart.update('none');
    } catch (e) { console.log("Koneksi Telemetri Terputus"); }
}

async function updateContainersMonitor() {
    try {
        const res = await fetch('/api/containers');
        const containers = await res.json();
        document.getElementById('container-count').innerText = containers.length;
        
        // Update header judul rak biar sinkron jumlahnya sesuai bahasa terpilih
        const l = dictionary[currentLang];
        document.getElementById('txt-rack-title').innerHTML = l.rackTitle.replace('$count', containers.length);

        const containerBox = document.getElementById('containers-container');
        containerBox.innerHTML = '';

        if(containers.length === 0) {
            containerBox.innerHTML = `<p style="color: #64748b; font-size: 14px; padding: 10px;">${l.rackEmpty}</p>`;
            return;
        }

        containers.forEach(c => {
            const isRunning = c.state === 'running';
            const ledClass = isRunning ? 'led-active' : 'led-offline';
            const statusColor = isRunning ? '#00ffcc' : '#ff0055';
            
            containerBox.innerHTML += `
                <div class="server-blade">
                    <div class="blade-left">
                        <div class="led-panel"><div class="led ${ledClass}"></div></div>
                        <div class="blade-details">
                            <h4>${c.name.toUpperCase()}</h4>
                            <p>SYS_ID: ${c.id} | IMAGE_SOURCE: ${c.image}</p>
                        </div>
                    </div>
                    <div class="blade-network"><i class="fa-solid fa-ethernet"></i> PORT: ${c.ports}</div>
                    <div class="blade-status-text" style="color: ${statusColor}; border-color: ${statusColor}50;">${c.state.toUpperCase()}</div>
                </div>`;
        });
    } catch (err) { console.log("Gagal sinkronisasi data kabinet server."); }
}

async function pruneContainers() {
    const l = dictionary[currentLang];
    if (!confirm(l.confirmPurge)) return;
    
    try {
        const res = await fetch('/api/containers/prune', { method: 'POST' });
        const result = await res.json();
        if (result.success) {
            alert(l.msgSuccess.replace('$count', result.message));
            updateContainersMonitor();
        } else {
            alert(l.msgError);
        }
    } catch (err) {
        alert(l.msgCritical);
    }
}

async function toggleSettingsModal(show) {
    const modal = document.getElementById('settingsModal');
    if (show) {
        modal.classList.add('active');
        const res = await fetch('/api/settings');
        const data = await res.json();
        document.getElementById('set-showCpu').checked = data.config.showCpu;
        document.getElementById('set-showRam').checked = data.config.showRam;
        document.getElementById('set-showUptime').checked = data.config.showUptime;
        document.getElementById('set-showTemp').checked = data.config.showTemp || false;
        document.getElementById('set-chartPoints').value = data.config.chartPoints;
        document.getElementById('set-lang').value = data.config.lang || 'id';
    } else { modal.classList.remove('active'); }
}

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const configData = {
        showCpu: document.getElementById('set-showCpu').checked,
        showRam: document.getElementById('set-showRam').checked,
        showUptime: document.getElementById('set-showUptime').checked,
        showTemp: document.getElementById('set-showTemp').checked,
        chartPoints: parseInt(document.getElementById('set-chartPoints').value) || 20,
        lang: document.getElementById('set-lang').value
    };
    await fetch('/api/settings/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configData) });
    toggleSettingsModal(false);
    fetchData();
});

setInterval(fetchData, 2000);
setInterval(updateContainersMonitor, 4000);
fetchData();
updateContainersMonitor();