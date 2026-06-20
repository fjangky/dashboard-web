const ctx = document.getElementById('cpuChart') ? document.getElementById('cpuChart').getContext('2d') : null;
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
        sysTitle: '<i class="fa-solid fa-server icon-sys-header"></i> Layanan Armbian System',
        dockerTitle: '<i class="fa-solid fa-box-archive"></i> Kontainer Docker',
        purgeBtn: '<i class="fa-solid fa-broom"></i> Bersihkan Kontainer Mati',
        modalTitle: 'Konfigurasi Panel',
        secIdentity: 'Identitas Perangkat',
        lblTitleInput: 'Nama Sistem Utama',
        lblHostInput: 'Nama Host / Tag',
        secLang: 'Bahasa Terpilih',
        lblLang: 'Pilih Bahasa',
        secTele: 'Modul Pemantauan',
        secNetwork: 'Jaringan',
        lblPort: 'Port Dashboard',
        optCpu: 'Pantau Status CPU',
        optRam: 'Pantau Status RAM',
        optUptime: 'Pantau Waktu Aktif',
        optTemp: 'Pantau Suhu Inti',
        optChart: 'Titik Segarkan Grafik',
        btnSave: 'Simpan Konfigurasi',
        rackEmpty: 'Tidak ada aplikasi aktif.',
        popConfirmTitle: 'Konfirmasi Pembersihan',
        confirmPurge: 'Apakah Anda ingin membersihkan Docker? Seluruh kontainer yang sudah berhenti akan dihapus.',
        popSuccessTitle: 'Docker Dibersihkan',
        msgSuccess: 'Berhasil menghapus $count kontainer tak terpakai.',
        popCleanTitle: 'Info Sistem',
        msgClean: 'Kontainer Docker Anda sudah bersih sepenuhnya!',
        popErrorTitle: 'Kesalahan Sistem',
        msgError: 'Gagal melakukan pembersihan sistem Docker.',
        msgCritical: 'Gagal tersambung dengan sistem inti server.',
        btnYes: 'Ya, Bersihkan', btnNo: 'Batal', btnOk: 'Selesai',
        copyright: '&copy; 2026 <span style="color: #00ffcc; font-weight: 600;">jangky-project</span>. Hak Cipta Dilindungi Undang-Undang.'
    },
    en: {
        cockpitBtn: '<i class="fa-solid fa-gear"></i> System Settings',
        chartTitle: '<i class="fa-solid fa-chart-line"></i> Real-Time Workload Stream',
        lblCpu: 'CPU Load',
        lblRam: 'RAM Usage',
        lblUptime: 'System Uptime',
        lblTemp: 'Device Temperature',
        sysTitle: '<i class="fa-solid fa-server icon-sys-header"></i> Armbian System Services',
        dockerTitle: '<i class="fa-solid fa-box-archive"></i> Docker Containers',
        purgeBtn: '<i class="fa-solid fa-broom"></i> Prune Idle Containers',
        modalTitle: 'Panel Configuration',
        secIdentity: 'Device Identity',
        lblTitleInput: 'Main System Title',
        lblHostInput: 'Host / Tag Name',
        secLang: 'System Language',
        lblLang: 'Choose Language',
        secTele: 'Monitoring Modules',
        secNetwork: 'Network',
        lblPort: 'Port Dashboard',
        optCpu: 'Monitor CPU Status',
        optRam: 'Monitor RAM Status',
        optUptime: 'Monitor System Uptime',
        optTemp: 'Monitor Device Temperature',
        optChart: 'Chart Refresh Points',
        btnSave: 'Save Configuration',
        rackEmpty: 'No active services.',
        popConfirmTitle: 'Docker Optimization',
        confirmPurge: 'Do you want to clear Docker? All stopped containers will be removed.',
        popSuccessTitle: 'Docker Purged',
        msgSuccess: 'Successfully cleared $count unused containers.',
        popCleanTitle: 'System Notification',
        msgClean: 'Your Docker space is already fully optimized!',
        popErrorTitle: 'System Error',
        msgError: 'Failed to perform Docker system prune.',
        msgCritical: 'Failed to connect to the server core system.',
        btnYes: 'Yes, Clean Up', btnNo: 'Cancel', btnOk: 'Got It',
        copyright: '&copy; 2026 <span style="color: #00ffcc; font-weight: 600;">jangky-project</span>. All Rights Reserved.'
    }
};

function showCustomPopup({ type, title, message, onConfirm = null }) {
    const overlay = document.getElementById('customPopup');
    const iconBox = document.getElementById('pop-icon');
    const titleBox = document.getElementById('pop-title');
    const msgBox = document.getElementById('pop-message');
    const btnBox = document.getElementById('pop-buttons');
    const l = dictionary[currentLang];

    if (!overlay || !iconBox || !titleBox || !msgBox || !btnBox) return;

    iconBox.className = "popup-icon";
    if (type === 'warn') { iconBox.classList.add('warn'); iconBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>'; }
    else if (type === 'success') { iconBox.classList.add('success'); iconBox.innerHTML = '<i class="fa-solid fa-circle-check"></i>'; }
    else if (type === 'error') { iconBox.classList.add('error'); iconBox.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>'; }

    titleBox.innerText = title; msgBox.innerText = message; btnBox.innerHTML = '';

    if (onConfirm) {
        const yesBtn = document.createElement('button'); yesBtn.className = 'btn-pop-confirm'; yesBtn.innerText = l.btnYes; yesBtn.onclick = () => { overlay.classList.remove('active'); onConfirm(); };
        const noBtn = document.createElement('button'); noBtn.className = 'btn-pop-cancel'; noBtn.innerText = l.btnNo; noBtn.onclick = () => overlay.classList.remove('active');
        btnBox.appendChild(noBtn); btnBox.appendChild(yesBtn);
    } else {
        const okBtn = document.createElement('button'); okBtn.className = 'btn-pop-confirm'; okBtn.innerText = l.btnOk; okBtn.onclick = () => overlay.classList.remove('active');
        btnBox.appendChild(okBtn);
    }
    overlay.classList.add('active');
}

function applyLanguage(lang) {
    currentLang = lang;
    const l = dictionary[lang];
    
    if(document.getElementById('btn-cockpit')) document.getElementById('btn-cockpit').innerHTML = l.cockpitBtn;
    if(document.getElementById('txt-chart-title')) document.getElementById('txt-chart-title').innerHTML = l.chartTitle;
    if(document.getElementById('txt-lbl-cpu')) document.getElementById('txt-lbl-cpu').innerText = l.lblCpu;
    if(document.getElementById('txt-lbl-ram')) document.getElementById('txt-lbl-ram').innerText = l.lblRam;
    if(document.getElementById('txt-lbl-uptime')) document.getElementById('txt-lbl-uptime').innerText = l.lblUptime;
    if(document.getElementById('txt-lbl-temp')) document.getElementById('txt-lbl-temp').innerText = l.lblTemp;
    
    if(document.getElementById('txt-sys-title') && document.getElementById('sys-count')) {
        const sysText = document.getElementById('sys-count').outerHTML;
        document.getElementById('txt-sys-title').innerHTML = `${l.sysTitle} ${sysText}`;
    }
    if(document.getElementById('txt-docker-title') && document.getElementById('docker-count')) {
        const dockerText = document.getElementById('docker-count').outerHTML;
        document.getElementById('txt-docker-title').innerHTML = `${l.dockerTitle} ${dockerText}`;
    }
    
    if(document.getElementById('btn-purge')) document.getElementById('btn-purge').innerHTML = `<i class="fa-solid fa-broom"></i> ${l.purgeBtn.replace('<i class="fa-solid fa-broom"></i> ', '')}`;
    if(document.getElementById('txt-modal-title')) document.getElementById('txt-modal-title').innerText = l.modalTitle;
    if(document.getElementById('txt-sec-identity')) document.getElementById('txt-sec-identity').innerText = l.secIdentity;
    if(document.getElementById('txt-lbl-title-input')) document.getElementById('txt-lbl-title-input').innerText = l.lblTitleInput;
    if(document.getElementById('txt-lbl-host-input')) document.getElementById('txt-lbl-host-input').innerText = l.lblHostInput;
    if(document.getElementById('txt-sec-lang')) document.getElementById('txt-sec-lang').innerText = l.secLang;
    if(document.getElementById('txt-lbl-lang')) document.getElementById('txt-lbl-lang').innerText = l.lblLang;
    if(document.getElementById('txt-sec-tele')) document.getElementById('txt-sec-tele').innerText = l.secTele;
    if(document.getElementById('txt-opt-cpu')) document.getElementById('txt-opt-cpu').innerText = l.optCpu;
    if(document.getElementById('txt-opt-ram')) document.getElementById('txt-opt-ram').innerText = l.optRam;
    if(document.getElementById('txt-opt-uptime')) document.getElementById('txt-opt-uptime').innerText = l.optUptime;
    if(document.getElementById('txt-opt-temp')) document.getElementById('txt-opt-temp').innerText = l.optTemp;
    if(document.getElementById('txt-opt-chart')) document.getElementById('txt-opt-chart').innerText = l.optChart;
    if(document.getElementById('btn-save-config')) document.getElementById('btn-save-config').innerText = l.btnSave;
    if(document.getElementById('txt-sec-network')) document.getElementById('txt-sec-network').innerText = l.secNetwork;
    if(document.getElementById('txt-lbl-port')) document.getElementById('txt-lbl-port').innerText = l.lblPort;
    
    const footerTextEl = document.getElementById('footer-text');
    if (footerTextEl) footerTextEl.innerHTML = l.copyright;
    
    const dashboardFooterEl = document.getElementById('dashboard-footer');
    if (dashboardFooterEl) dashboardFooterEl.innerHTML = l.copyright;
}

// --- INISIALISASI GRAFIK SECARA AMAN ---
const cpuChart = ctx ? new Chart(ctx, {
    type: 'line',
    data: { 
        labels: [], 
        datasets: [{ 
            label: 'CPU', 
            data: [], 
            borderColor: '#00ffcc', 
            backgroundColor: function(context) {
                const chart = context.chart;
                const {ctx, chartArea} = chart;
                if (!chartArea) return null;
                
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, 'rgba(0, 255, 204, 0.25)');
                gradient.addColorStop(0.5, 'rgba(2, 132, 199, 0.08)');
                gradient.addColorStop(1, 'rgba(11, 17, 30, 0)');
                return gradient;
            },
            fill: true, 
            tension: 0.4, 
            borderWidth: 3, 
            pointRadius: 0,
            pointHoverRadius: 5
        }] 
    },
    options: { 
        responsive: true, 
        maintainAspectRatio: false,
        animation: false, 
        plugins: { legend: { display: false } }, 
        scales: { 
            x: { 
                grid: { display: false },
                ticks: { color: '#4b5563', font: { family: 'JetBrains Mono', size: 9 } }
            }, 
            y: { 
                min: 0, 
                max: 100, 
                grid: { color: 'rgba(255, 255, 255, 0.03)', borderDash: [5, 5] }, 
                ticks: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 11 }, stepSize: 25 } 
            } 
        } 
    }
}) : null;

async function fetchData() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if(document.getElementById('cpu-text')) document.getElementById('cpu-text').innerHTML = `${data.cpuUsage}<span>%</span>`;
        if(document.getElementById('ram-text')) document.getElementById('ram-text').innerHTML = `${data.ramUsage}<span>%</span>`;
        if(document.getElementById('uptime-text')) document.getElementById('uptime-text').innerHTML = `${data.uptime}<span>s</span>`;
        if(document.getElementById('temp-text')) document.getElementById('temp-text').innerHTML = `${data.temperature}<span>°C</span>`;
        
        if(data.diskUsage) {
            if(document.getElementById('disk-text')) document.getElementById('disk-text').innerHTML = `${data.diskUsage.percent}<span>%</span>`;
            if(document.getElementById('disk-detail')) document.getElementById('disk-detail').innerText = `${data.diskUsage.used} / ${data.diskUsage.total} GB`;
        }
        
        if(document.getElementById('card-cpu')) document.getElementById('card-cpu').style.display = data.config.showCpu ? 'flex' : 'none';
        if(document.getElementById('card-ram')) document.getElementById('card-ram').style.display = data.config.showRam ? 'flex' : 'none';
        if(document.getElementById('card-uptime')) document.getElementById('card-uptime').style.display = data.config.showUptime ? 'flex' : 'none';
        if(document.getElementById('card-temp')) document.getElementById('card-temp').style.display = data.config.showTemp ? 'flex' : 'none';
        
        maxChartPoints = data.config.chartPoints || 20;
        if(document.getElementById('main-app-logo')) {
            document.getElementById('main-app-logo').innerHTML = `${data.config.mainTitle || "Sistem Pusat Kendali"} <span id="main-app-host">${data.config.hostTag || "STB-SERVER"}</span>`;
        }
        
        applyLanguage(data.config.lang || 'id');

        if (cpuChart) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            while (cpuChart.data.labels.length >= maxChartPoints) { 
                cpuChart.data.labels.shift(); 
                cpuChart.data.datasets[0].data.shift(); 
            }
            cpuChart.data.labels.push(time); 
            cpuChart.data.datasets[0].data.push(data.cpuUsage); 
            cpuChart.update('none');
        }
    } catch (e) { console.log("Sambungan telemetri terputus."); }
}

async function updateContainersMonitor() {
    try {
        const res = await fetch('/api/services');
        const services = await res.json();
        
        if(document.getElementById('sys-count')) document.getElementById('sys-count').innerText = `(${services.system.length})`;
        if(document.getElementById('docker-count')) document.getElementById('docker-count').innerText = `(${services.docker.length})`;

        const sysBox = document.getElementById('system-services-container');
        const dockerBox = document.getElementById('docker-services-container');
        
        if (sysBox) {
            sysBox.innerHTML = '';
            if(services.system.length === 0) {
                sysBox.innerHTML = `<p style="color: #9ca3af; font-size: 13px; padding: 15px; text-align: center;">${dictionary[currentLang].rackEmpty}</p>`;
            } else {
                services.system.forEach(s => sysBox.innerHTML += createBladeHtml(s));
            }
        }

        if (dockerBox) {
            dockerBox.innerHTML = '';
            if(services.docker.length === 0) {
                dockerBox.innerHTML = `<p style="color: #9ca3af; font-size: 13px; padding: 15px; text-align: center;">${dictionary[currentLang].rackEmpty}</p>`;
            } else {
                services.docker.forEach(s => dockerBox.innerHTML += createBladeHtml(s));
            }
        }
    } catch (err) { console.log("Gagal menyinkronkan daftar aplikasi."); }
}

function createBladeHtml(s) {
    const isRunning = s.state === 'running';
    const ledClass = isRunning ? 'led-active' : 'led-offline';
    const statusColor = isRunning ? '#00ffcc' : '#f87171';
    const statusBg = isRunning ? 'rgba(0, 255, 204, 0.05)' : 'rgba(248, 113, 113, 0.05)';
    const statusText = isRunning ? (currentLang === 'id' ? 'Aktif' : 'Active') : (currentLang === 'id' ? 'Berhenti' : 'Stopped');
    
    const netIcon = s.type === 'system' ? '<i class="fa-solid fa-network-wired"></i>' : '<i class="fa-solid fa-ethernet"></i>';
    const osBadge = s.type === 'system' ? '<span style="font-size:10px; color:#38bdf8; border:1px solid rgba(56,189,248,0.4); padding:1px 5px; border-radius:4px; font-weight:500;">OS</span>' : '';

    return `
        <div class="server-blade">
            <div class="blade-left">
                <div class="led ${ledClass}"></div>
                <div class="blade-details">
                    <h4>${s.name} ${osBadge}</h4>
                    <p>ID: ${s.id} | Base: ${s.image}</p>
                </div>
            </div>
            <div class="blade-network">${netIcon} Port: ${s.ports}</div>
            <div class="blade-status-text" style="color: ${statusColor}; background: ${statusBg};">
                ${statusText}
            </div>
        </div>`;
}

function pruneContainers() {
    const l = dictionary[currentLang];
    showCustomPopup({
        type: 'warn', title: l.popConfirmTitle, message: l.confirmPurge,
        onConfirm: async () => {
            try {
                const res = await fetch('/api/containers/prune', { method: 'POST' });
                const result = await res.json();
                if (result.success) {
                    if (result.message > 0) { showCustomPopup({ type: 'success', title: l.popSuccessTitle, message: l.msgSuccess.replace('$count', result.message) }); }
                    else { showCustomPopup({ type: 'success', title: l.popCleanTitle, message: l.msgClean }); }
                    updateContainersMonitor();
                } else { showCustomPopup({ type: 'error', title: l.popErrorTitle, message: l.msgError }); }
            } catch (err) { showCustomPopup({ type: 'error', title: l.popErrorTitle, message: l.msgCritical }); }
        }
    });
}

async function toggleSettingsModal(show) {
    const modal = document.getElementById('settingsModal');
    if (!modal) return;
    
    if (show) {
        modal.classList.add('active');
        const res = await fetch('/api/settings');
        const data = await res.json();
        if(document.getElementById('set-showCpu')) document.getElementById('set-showCpu').checked = data.config.showCpu;
        if(document.getElementById('set-showRam')) document.getElementById('set-showRam').checked = data.config.showRam;
        if(document.getElementById('set-showUptime')) document.getElementById('set-showUptime').checked = data.config.showUptime;
        if(document.getElementById('set-showTemp')) document.getElementById('set-showTemp').checked = data.config.showTemp; 
        if(document.getElementById('set-chartPoints')) document.getElementById('set-chartPoints').value = data.config.chartPoints;
        if(document.getElementById('set-lang')) document.getElementById('set-lang').value = data.config.lang || 'id';
        if(document.getElementById('set-mainTitle')) document.getElementById('set-mainTitle').value = data.config.mainTitle || '';
        if(document.getElementById('set-hostTag')) document.getElementById('set-hostTag').value = data.config.hostTag || '';
        if(document.getElementById('set-dashboardPort')) document.getElementById('set-dashboardPort').value = data.config.dashboardPort || 3080;
    } else { modal.classList.remove('active'); }
}

if(document.getElementById('settingsForm')) {
    document.getElementById('settingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const configData = {
            showCpu: document.getElementById('set-showCpu').checked, showRam: document.getElementById('set-showRam').checked,
            showUptime: document.getElementById('set-showUptime').checked, showTemp: document.getElementById('set-showTemp').checked,
            dashboardPort: parseInt(document.getElementById('set-dashboardPort').value) || 3080,
            chartPoints: parseInt(document.getElementById('set-chartPoints').value) || 20, lang: document.getElementById('set-lang').value,
            mainTitle: document.getElementById('set-mainTitle').value.trim(), hostTag: document.getElementById('set-hostTag').value.trim()
        };
        await fetch('/api/settings/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configData) });
        toggleSettingsModal(false); fetchData(); setTimeout(updateContainersMonitor, 500);
    });
}

setInterval(fetchData, 2000);
setInterval(updateContainersMonitor, 4000);
fetchData();
updateContainersMonitor();

// --- FUNGSI WAKTU REAL-TIME ---
function updateTime() {
    const now = new Date();
    document.getElementById('live-time').innerText = now.toLocaleTimeString('id-ID', { hour12: false });
}
setInterval(updateTime, 1000);
updateTime(); // Jalankan sekali saat load

// --- FUNGSI CUACA (Menggunakan IP Geolocation gratis) ---
async function fetchWeather() {
    try {
        // Mendapatkan lokasi berdasarkan IP (gratis & tanpa API Key)
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        const city = ipData.city;
        
        // Menampilkan lokasi
        document.getElementById('location').innerText = city;

        // Mengambil cuaca dari wttr.in (Sangat ringan untuk STB)
        const weatherRes = await fetch(`https://wttr.in/${city}?format=%t`);
        const temp = await weatherRes.text();
        document.getElementById('temp').innerText = temp;
    } catch (err) {
        console.error("Gagal memuat cuaca:", err);
        document.getElementById('location').innerText = "Lokasi Tidak Diketahui";
    }
}
fetchWeather();
// Update cuaca setiap 30 menit
setInterval(fetchWeather, 1800000);