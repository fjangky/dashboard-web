const ctx = document.getElementById('cpuChart').getContext('2d');
let maxChartPoints = 20;
let currentLang = 'id';

const dictionary = {
    id: {
        cockpitBtn: '<i class="fa-solid fa-gear"></i> Pengaturan Sistem',
        chartTitle: '<i class="fa-solid fa-chart-line"></i> Grafik Beban Kerja Real-Time',
        lblCpu: 'Beban CPU',
        lblRam: 'Penggunaan RAM',
        lblUptime: 'Waktu Aktif Sistem',
        lblTemp: 'Suhu Perangkat',
        rackTitle: '<i class="fa-solid fa-server"></i> Daftar Layanan Aplikasi ($count Terpasang)',
        purgeBtn: '<i class="fa-solid fa-broom"></i> Bersihkan Aplikasi Mati',
        modalTitle: 'Konfigurasi Panel',
        secIdentity: 'Identitas Perangkat',
        lblTitleInput: 'Nama Sistem Utama',
        lblHostInput: 'Nama Host / Tag',
        secLang: 'Bahasa Terpilih',
        lblLang: 'Pilih Bahasa',
        secTele: 'Modul Pemantauan',
        optCpu: 'Pantau Status CPU',
        optRam: 'Pantau Status RAM',
        optUptime: 'Pantau Waktu Aktif',
        optTemp: 'Pantau Suhu Inti',
        optChart: 'Titik Segarkan Grafik',
        btnSave: 'Simpan Konfigurasi',
        rackEmpty: 'Belum ada aplikasi yang berjalan di sistem Anda.',
        popConfirmTitle: 'Konfirmasi Pembersihan',
        confirmPurge: 'Apakah Anda ingin membersihkan sistem? Seluruh aplikasi kontainer yang sudah berhenti (tidak aktif) akan dihapus secara aman.',
        popSuccessTitle: 'Sistem Dibersihkan',
        msgSuccess: 'Sistem berhasil dibersihkan! Bersama dengan $count kontainer tak terpakai.',
        popCleanTitle: 'Info Sistem',
        msgClean: 'Sistem Anda sudah bersih sepenuhnya!',
        popErrorTitle: 'Kesalahan Sistem',
        msgError: 'Gagal melakukan pembersihan sistem Docker.',
        msgCritical: 'Gagal tersambung dengan sistem inti server.',
        btnYes: 'Ya, Bersihkan',
        btnNo: 'Batal',
        btnOk: 'Selesai'
    },
    en: {
        cockpitBtn: '<i class="fa-solid fa-gear"></i> System Settings',
        chartTitle: '<i class="fa-solid fa-chart-line"></i> Real-Time Workload Stream',
        lblCpu: 'CPU Load',
        lblRam: 'RAM Usage',
        lblUptime: 'System Uptime',
        lblTemp: 'Device Temperature',
        rackTitle: '<i class="fa-solid fa-server"></i> Application Services List ($count Installed)',
        purgeBtn: '<i class="fa-solid fa-broom"></i> Clear Idle Applications',
        modalTitle: 'Panel Configuration',
        secIdentity: 'Device Identity',
        lblTitleInput: 'Main System Title',
        lblHostInput: 'Host / Tag Name',
        secLang: 'System Language',
        lblLang: 'Choose Language',
        secTele: 'Monitoring Modules',
        optCpu: 'Monitor CPU Status',
        optRam: 'Monitor RAM Status',
        optUptime: 'Monitor System Uptime',
        optTemp: 'Monitor Device Temperature',
        optChart: 'Chart Refresh Points',
        btnSave: 'Save Configuration',
        rackEmpty: 'No applications are running on your system yet.',
        popConfirmTitle: 'System Optimization',
        confirmPurge: 'Do you want to clean up the system? All stopped container applications will be safely removed.',
        popSuccessTitle: 'System Purged',
        msgSuccess: 'System cleared successfully! Removed $count unused containers.',
        popCleanTitle: 'System Notification',
        msgClean: 'Your system is already fully optimized!',
        popErrorTitle: 'System Error',
        msgError: 'Failed to perform Docker system prune.',
        msgCritical: 'Failed to connect to the server core system.',
        btnYes: 'Yes, Clean Up',
        btnNo: 'Cancel',
        btnOk: 'Got It'
    }
};

function showCustomPopup({ type, title, message, onConfirm = null }) {
    const overlay = document.getElementById('customPopup');
    const iconBox = document.getElementById('pop-icon');
    const titleBox = document.getElementById('pop-title');
    const msgBox = document.getElementById('pop-message');
    const btnBox = document.getElementById('pop-buttons');
    const l = dictionary[currentLang];

    iconBox.className = "popup-icon";
    if (type === 'warn') { iconBox.classList.add('warn'); iconBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>'; }
    else if (type === 'success') { iconBox.classList.add('success'); iconBox.innerHTML = '<i class="fa-solid fa-circle-check"></i>'; }
    else if (type === 'error') { iconBox.classList.add('error'); iconBox.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>'; }

    titleBox.innerText = title;
    msgBox.innerText = message;
    btnBox.innerHTML = '';

    if (onConfirm) {
        const yesBtn = document.createElement('button');
        yesBtn.className = 'btn-pop-confirm';
        yesBtn.innerText = l.btnYes;
        yesBtn.onclick = () => { overlay.classList.remove('active'); onConfirm(); };

        const noBtn = document.createElement('button');
        noBtn.className = 'btn-pop-cancel';
        noBtn.innerText = l.btnNo;
        noBtn.onclick = () => overlay.classList.remove('active');

        btnBox.appendChild(noBtn);
        btnBox.appendChild(yesBtn);
    } else {
        const okBtn = document.createElement('button');
        okBtn.className = 'btn-pop-confirm';
        okBtn.innerText = l.btnOk;
        okBtn.onclick = () => overlay.classList.remove('active');
        btnBox.appendChild(okBtn);
    }

    overlay.classList.add('active');
}

function applyLanguage(lang, count = 0) {
    currentLang = lang;
    const l = dictionary[lang];
    
    document.getElementById('btn-cockpit').innerHTML = l.cockpitBtn;
    document.getElementById('txt-chart-title').innerHTML = l.chartTitle;
    document.getElementById('txt-lbl-cpu').innerText = l.lblCpu;
    document.getElementById('txt-lbl-ram').innerText = l.lblRam;
    document.getElementById('txt-lbl-uptime').innerText = l.lblUptime;
    document.getElementById('txt-lbl-temp').innerText = l.lblTemp;
    document.getElementById('txt-rack-title').innerHTML = l.rackTitle.replace('$count', count);
    document.getElementById('btn-purge').innerHTML = l.purgeBtn;
    
    document.getElementById('txt-modal-title').innerText = l.modalTitle;
    document.getElementById('txt-sec-identity').innerText = l.secIdentity;
    document.getElementById('txt-lbl-title-input').innerText = l.lblTitleInput;
    document.getElementById('txt-lbl-host-input').innerText = l.lblHostInput;
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

const cpuChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{ label: 'CPU', data: [], borderColor: '#00ffcc', backgroundColor: 'rgba(0, 255, 204, 0.01)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 }]
    },
    options: { 
        responsive: true, 
        plugins: { legend: { display: false } }, 
        scales: { 
            x: { display: false }, 
            y: { min: 0, max: 100, grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 11 } } } 
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
        
        document.getElementById('card-cpu').style.display = data.config.showCpu ? 'flex' : 'none';
        document.getElementById('card-ram').style.display = data.config.showRam ? 'flex' : 'none';
        document.getElementById('card-uptime').style.display = data.config.showUptime ? 'flex' : 'none';
        document.getElementById('card-temp').style.display = data.config.showTemp ? 'flex' : 'none';
        
        maxChartPoints = data.config.chartPoints;

        // Render Teks Dinamis Hasil Input Kustomisasi
        const finalTitle = data.config.mainTitle || "Sistem Pusat Kendali";
        const finalHost = data.config.hostTag || "STB-SERVER";
        document.getElementById('main-app-logo').innerHTML = `${finalTitle} <span id="main-app-host">${finalHost}</span>`;
        
        const countMatch = document.getElementById('txt-rack-title').innerText.match(/\d+/);
        const currentCount = countMatch ? countMatch[0] : 0;
        
        applyLanguage(data.config.lang || 'id', currentCount);

        const time = new Date().toLocaleTimeString();
        while (cpuChart.data.labels.length >= maxChartPoints) {
            cpuChart.data.labels.shift();
            cpuChart.data.datasets[0].data.shift();
        }
        cpuChart.data.labels.push(time);
        cpuChart.data.datasets[0].data.push(data.cpuUsage);
        cpuChart.update('none');
    } catch (e) { console.log("Sambungan telemetri terputus."); }
}

async function updateContainersMonitor() {
    try {
        const res = await fetch('/api/containers');
        const containers = await res.json();
        
        const l = dictionary[currentLang];
        document.getElementById('txt-rack-title').innerHTML = l.rackTitle.replace('$count', containers.length);

        const containerBox = document.getElementById('containers-container');
        containerBox.innerHTML = '';

        if(containers.length === 0) {
            containerBox.innerHTML = `<p style="color: #9ca3af; font-size: 14px; padding: 15px; text-align: center;">${l.rackEmpty}</p>`;
            return;
        }

        containers.forEach(c => {
            const isRunning = c.state === 'running';
            const ledClass = isRunning ? 'led-active' : 'led-offline';
            const statusColor = isRunning ? '#00ffcc' : '#f87171';
            const statusBg = isRunning ? 'rgba(0, 255, 204, 0.05)' : 'rgba(248, 113, 113, 0.05)';
            const statusText = isRunning ? (currentLang === 'id' ? 'Aktif' : 'Active') : (currentLang === 'id' ? 'Berhenti' : 'Stopped');
            
            containerBox.innerHTML += `
                <div class="server-blade">
                    <div class="blade-left">
                        <div class="led-panel"><div class="led ${ledClass}"></div></div>
                        <div class="blade-details">
                            <h4>${c.name}</h4>
                            <p>ID: ${c.id} | Image: ${c.image}</p>
                        </div>
                    </div>
                    <div class="blade-network"><i class="fa-solid fa-ethernet"></i> Port: ${c.ports}</div>
                    <div class="blade-status-text" style="color: ${statusColor}; background: ${statusBg};">
                        ${statusText}
                    </div>
                </div>`;
        });
    } catch (err) { console.log("Gagal menyinkronkan daftar aplikasi."); }
}

function pruneContainers() {
    const l = dictionary[currentLang];
    showCustomPopup({
        type: 'warn',
        title: l.popConfirmTitle,
        message: l.confirmPurge,
        onConfirm: async () => {
            try {
                const res = await fetch('/api/containers/prune', { method: 'POST' });
                const result = await res.json();
                if (result.success) {
                    if (result.message > 0) {
                        showCustomPopup({ type: 'success', title: l.popSuccessTitle, message: l.msgSuccess.replace('$count', result.message) });
                    } else {
                        showCustomPopup({ type: 'success', title: l.popCleanTitle, message: l.msgClean });
                    }
                    updateContainersMonitor();
                } else {
                    showCustomPopup({ type: 'error', title: l.popErrorTitle, message: l.msgError });
                }
            } catch (err) {
                showCustomPopup({ type: 'error', title: l.popErrorTitle, message: l.msgCritical });
            }
        }
    });
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
        // Isi nilai input kustom
        document.getElementById('set-mainTitle').value = data.config.mainTitle || '';
        document.getElementById('set-hostTag').value = data.config.hostTag || '';
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
        lang: document.getElementById('set-lang').value,
        mainTitle: document.getElementById('set-mainTitle').value.trim(),
        hostTag: document.getElementById('set-hostTag').value.trim()
    };
    await fetch('/api/settings/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configData) });
    toggleSettingsModal(false);
    fetchData();
    setTimeout(updateContainersMonitor, 500);
});

setInterval(fetchData, 2000);
setInterval(updateContainersMonitor, 4000);
fetchData();
updateContainersMonitor();