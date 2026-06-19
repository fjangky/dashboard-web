const ctx = document.getElementById('cpuChart').getContext('2d');
let maxChartPoints = 20;

const cpuChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{ label: 'CPU', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.05)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#555', font: { size: 10 } } } } }
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

        const time = new Date().toLocaleTimeString();
        while (cpuChart.data.labels.length >= maxChartPoints) {
            cpuChart.data.labels.shift();
            cpuChart.data.datasets[0].data.shift();
        }
        cpuChart.data.labels.push(time);
        cpuChart.data.datasets[0].data.push(data.cpuUsage);
        cpuChart.update('none');
    } catch (e) { console.log("Koneksi API Terputus"); }
}

async function updateContainersMonitor() {
    try {
        const res = await fetch('/api/containers');
        const containers = await res.json();
        document.getElementById('container-count').innerText = containers.length;
        const containerBox = document.getElementById('containers-container');
        containerBox.innerHTML = '';

        if(containers.length === 0) {
            containerBox.innerHTML = `<p style="color: #6b7280; font-size: 14px; grid-column: 1/-1;">Tidak ada kontainer Docker ditemukan.</p>`;
            return;
        }

        containers.forEach(c => {
            const isRunning = c.state === 'running';
            const badgeClass = isRunning ? 'status-running' : 'status-stopped';
            containerBox.innerHTML += `
                <div class="card app-card">
                    <div class="app-info">
                        <div class="app-icon-box"><i class="fa-solid ${isRunning ? 'fa-cube' : 'fa-box-tissue'}"></i></div>
                        <div class="app-details" style="width: 80%;">
                            <h4>${c.name}</h4>
                            <p style="color: #6b7280; font-size: 11px;">ID: ${c.id} | Image: ${c.image}</p>
                            <p style="font-size: 13px; color: #e5e7eb;"><i class="fa-solid fa-network-wired" style="font-size:11px; margin-right:4px;"></i> Ports: ${c.ports}</p>
                            <div style="margin-top: 8px;">
                                <span class="status-badge ${badgeClass}">${c.state}</span>
                                <span style="font-size: 11px; color: #9ca3af; margin-left: 5px;">${c.status}</span>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
    } catch (err) { console.log("Gagal memperbarui info kontainer."); }
}

async function pruneContainers() {
    if (!confirm("Apakah Anda yakin ingin menghapus keseluruhan kontainer yang statusnya mati (Exited/Stopped) secara bersih? Kontainer yang sedang berjalan (Running) akan tetap aman.")) return;
    
    try {
        const res = await fetch('/api/containers/prune', { method: 'POST' });
        const result = await res.json();
        if (result.success) {
            alert(result.message);
            updateContainersMonitor();
        } else {
            alert("Gagal membersihkan: " + result.error);
        }
    } catch (err) {
        alert("Gagal terhubung ke server.");
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
    } else { modal.classList.remove('active'); }
}

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const configData = {
        showCpu: document.getElementById('set-showCpu').checked, showRam: document.getElementById('set-showRam').checked,
        showUptime: document.getElementById('set-showUptime').checked, showTemp: document.getElementById('set-showTemp').checked,
        chartPoints: parseInt(document.getElementById('set-chartPoints').value) || 20
    };
    await fetch('/api/settings/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configData) });
    toggleSettingsModal(false);
    fetchData();
});

setInterval(fetchData, 2000);
setInterval(updateContainersMonitor, 4000);
fetchData();
updateContainersMonitor();