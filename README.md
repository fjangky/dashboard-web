# Mainframe STB Monitor 🚀

Dashboard monitoring perangkat keras (hardware) berbasis web yang ringan dan futuristik, dirancang khusus untuk STB (Set-Top Box) yang menjalankan Armbian Linux. Dashboard ini juga dilengkapi dengan manajemen kontainer Docker terintegrasi untuk memantau dan membersihkan sistem secara bersih.

![Mainframe UI Visual](https://img.shields.io/badge/UI-Cyberpunk%20%2F%20Futuristic-00ffcc?style=for-the-badge)
![Dockerode](https://img.shields.io/badge/Docker-Integrated-blue?style=for-the-badge&logo=docker)
![NodeJS](https://img.shields.io/badge/Node.js-v16+-green?style=for-the-badge&logo=node.js)

---

## 🌟 Fitur Utama

* **Real-time Telemetry Stream:** Grafik pergerakan beban CPU secara langsung menggunakan Chart.js.
* **Hardware Status Sidebar:** Memantau Beban CPU, Penggunaan RAM, Uptime Sistem, dan Sensor Suhu Inti perangkat secara real-time.
* **Cockpit System (Pengaturan Modular):** Mengaktifkan/menonaktifkan modul tampilan yang diinginkan serta mengatur batas titik grafik secara dinamis.
* **Server Rack Aesthetic:** Tampilan daftar kontainer Docker yang didesain menyerupai bilah modul rak server (*Blade Server*) lengkap dengan indikator lampu LED status (Aktif/Mati).
* **Purge Dead Blades (Sapu Bersih):** Tombol aksi sekali klik untuk menghapus seluruh kontainer Docker yang sudah tidak terpakai (*Stopped/Exited*) secara menyeluruh tanpa mengganggu kontainer yang sedang berjalan.

---

## 📋 Prasyarat Sistem

Sebelum menginstal, pastikan STB Anda sudah terpasang perangkat lunak berikut:

1. **Node.js** (Versi 16 atau yang lebih baru) & **NPM**
2. **Docker Engine** (Sudah berjalan di latar belakang)
3. **PM2** (Untuk menjaga aplikasi tetap hidup 24/7)

---

## 🛠️ Langkah Instalasi & Penggunaan

Ikuti langkah-langkah di bawah ini untuk memasang dashboard di STB Armbian Anda:

### 1. Kloning Repositori
Masuk ke terminal SSH STB Anda, lalu kloning repositori ini ke folder sistem Anda (misalnya `/opt`):
```bash
cd /opt
```
```bash
sudo git clone [https://github.com/fjangky/dashboard-web.git](https://github.com/fjangky/dashboard-web.git)
```
```bash
cd dashboard-web
```

### 2. Instal Dependensi
Pasang semua pustaka (library) Node.js yang dibutuhkan oleh sistem (termasuk `express`, `systeminformation`, dan `dockerode`):
```bash
npm install
```
### 3. Konfigurasi Port (Opsional)
Secara default, aplikasi berjalan pada port  `3000` (atau `3080`). Jika Anda ingin mengubah portnya, buka file `server.js` menggunakan editor teks:
```bash
nano server.js
```
Cari baris `const PORT = 3000;` atau `3080;` dan ganti angkanya sesuai kebutuhan Anda, lalu simpan (`CTRL+O` -> `Enter` -> `CTRL+X`).

---

## 🏃‍♂️ Menjalankan Aplikasi
Untuk menjalankan aplikasi ini di server STB, sangat disarankan menggunakan **PM2** agar dashboard otomatis berjalan kembali jika STB mendadak *reboot* atau mati lampu.
### Menjalankan dengan PM2 (Direkomendasikan)
```bash
# Jalankan aplikasi dan beri nama "dashboard"
sudo pm2 start server.js --name "dashboard"
```
```bash
# Simpan konfigurasi PM2 agar otomatis berjalan saat STB booting
sudo pm2 save
```
### Menjalankan untuk Pengujian (Development Mode)
Jika hanya ingin menguji kodenya tanpa berjalan di latar belakang:
```bash
npm start
```
Setelah berhasil dijalankan, buka browser di komputer atau HP Anda yang berada dalam satu jaringan Wi-Fi/LAN, lalu akses alamat IP STB Anda:  
`http://IP_STB_ANDA:3000/`
(*Contoh: http://192.168.18.10:3000/ atau http://192.168.18.10:3080/*)

---

## 🔄 Cara Memperbarui Kode di STB
Jika di kemudian hari Anda melakukan pembaruan kode di GitHub dan ingin menerapkannya langsung ke STB, Anda hanya perlu menjalankan rangkaian perintah ringkas ini di dalam terminal STB Anda:
```bash
cd /opt/dashboard-web
```
```bash
sudo git pull origin main
```
```bash
npm install
```
```bash
sudo pm2 restart dashboard
```

---

## 🤝 Kontribusi
Kontribusi, pelaporan bug, dan saran fitur baru sangat terbuka untuk pengembangan dashboard ini agar menjadi lebih baik. Silakan buat *Issue* atau kirimkan *Pull Request*.
