# Jalur.in (Logistics Management)

**Logistik Terpantau, Bisnis Lancar.**

![Jalur.in Login Page](https://i.imgur.com/your-image-url.png) **Jalur.in** adalah sebuah **Progressive Web App (PWA)** yang dirancang untuk membantu Usaha Mikro, Kecil, dan Menengah (UMKM) dalam mengelola dan memantau proses pengiriman logistik mereka. Aplikasi ini menyediakan dashboard intuitif untuk tiga peran utama: **Manajer**, **Supir**, dan **Admin**.

Versi saat ini adalah **aplikasi frontend murni** yang menggunakan `localStorage` untuk simulasi database, sehingga semua fungsionalitas dapat dicoba langsung di browser tanpa memerlukan backend.

---

## ✨ Fitur Utama

Aplikasi ini dibagi berdasarkan peran pengguna, dengan fitur-fitur spesifik untuk masing-masing peran:

### 🧑‍💼 Untuk Manajer
* **Dasbor Real-time:** Memantau status semua pengiriman yang sedang menunggu atau dalam perjalanan.
* **Pelacakan Peta:** Melihat lokasi terakhir supir yang sedang bertugas melalui peta interaktif (Leaflet.js).
* **Manajemen Surat Jalan:** Membuat, melihat, dan mengelola surat jalan baru dengan mudah.
* **Riwayat Pengiriman:** Mengarsipkan dan melihat detail semua pengiriman yang telah selesai.
* **Manajemen Supir:** Menambah, mengedit, dan melihat data supir yang terdaftar.
* **Keuangan:** Mencatat dan melacak transaksi uang jalan untuk setiap pengiriman.
* **Laporan Kendala:** Melihat semua laporan kendala yang dikirimkan oleh supir, lengkap dengan foto bukti.

### 🚚 Untuk Supir
* **Daftar Tugas:** Melihat daftar tugas pengiriman yang harus dijalankan (aktif) dan yang sudah selesai (riwayat).
* **Aksi Tugas:** Memperbarui status pengiriman dari "Menunggu" menjadi "Dalam Perjalanan" dan "Selesai".
* **Update Lokasi:** Mengirim pembaruan lokasi secara manual untuk pelacakan oleh manajer.
* **Lapor Kendala:** Mengirim laporan jika terjadi kendala di perjalanan, lengkap dengan deskripsi, kategori, dan upload foto.
* **Info Uang Jalan:** Melihat riwayat transaksi uang jalan yang telah diterima.

### ⚙️ Untuk Admin
* **Manajemen Pengguna:** Mengelola semua akun pengguna (manajer, supir, admin), termasuk menambah, mengedit, dan menghapus akun.
* **Pengaturan Aplikasi:** Mengelola data master seperti jenis kendaraan yang tersedia dan kategori laporan kendala.

---

## 🛠️ Teknologi yang Digunakan

* **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript (ES6)
* **Penyimpanan Data:** `localStorage` & `sessionStorage` (untuk simulasi backend)
* **PWA (Progressive Web App):** Manifest, Service Worker untuk fungsionalitas offline.
* **Peta:** [Leaflet.js](https://leafletjs.com/)
* **Ikon:** [Font Awesome](https://fontawesome.com/)
* **Notifikasi:** [Toastify.js](https://apvarun.github.io/toastify-js/)

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

Karena ini adalah proyek frontend murni, Anda tidak memerlukan setup yang rumit.

**Cara Termudah (Menggunakan VS Code & Live Server):**
1.  Buka folder proyek di Visual Studio Code.
2.  Pastikan Anda sudah meng-install ekstensi [**Live Server**](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
3.  Klik kanan pada file `index.html`.
4.  Pilih **"Open with Live Server"**.
5.  Browser akan otomatis terbuka dan aplikasi siap digunakan.

---

## 🔑 Akun Demo

Gunakan akun di bawah ini untuk mencoba aplikasi dengan peran yang berbeda:

* **Manager:**
    * **Username:** `manager`
    * **Password:** `123`
* **Supir:**
    * **Username:** `supir_budi`
    * **Password:** `123`
* **Admin:**
    * **Username:** `admin`
    * **Password:** `123`

---

## 🔮 Rencana ke Depan

Proyek ini adalah fondasi yang solid. Rencana pengembangan selanjutnya adalah mengubahnya menjadi aplikasi **full-stack** dengan:
* **Backend:** Menggunakan PHP atau Node.js.
* **Database:** Menggunakan MySQL atau PostgreSQL.
* **Deployment:** Meng-hosting aplikasi di layanan seperti Render atau Vercel untuk bisa diakses secara online oleh banyak pengguna secara bersamaan.

---

Dibuat dengan ❤️ oleh [Yurida Zani]
