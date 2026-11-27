# RespiCare — Sistem Manajemen Terapi & Monitoring Kesehatan Pernapasan

> **Demo Live:** <https://respicare-self-manager.vercel.app>
**RespiCare** adalah platform web manajemen terapi pernapasan mandiri dan pendampingan medis jarak jauh yang dirancang untuk meningkatkan kepatuhan pengobatan pasien gangguan pernapasan (Asma, PPOK, bronkitis, dan ISPA) sekaligus mendukung pendekatan preventif berbasis inovasi kefarmasian lokal.

## Latar Belakang & Konteks Inovasi (KOFEIN 2027)

Proyek ini dikembangkan sebagai bagian dari gagasan inovasi kefarmasian pada kompetisi **KOFEIN 2027 (Fakultas Farmasi Universitas Airlangga)** dengan tema *"Optimalisasi Peran Kefarmasian dalam Mendukung Kesehatan Sistem Pernapasan melalui Terapi, Pencegahan, dan Inovasi Teknologi"*.
1. **Tantangan Polusi Multisumber & Pancaroba:** Masyarakat di wilayah semi-agraris dan industri (studi kasus Kabupaten Kediri) menghadapi paparan polutan udara harian—mulai dari emisi pabrik, pembakaran sisa panen, debu jalanan, hingga asap rokok—yang memicu lonjakan kasus ISPA saat peralihan musim.
2. **Integrasi Terapi & Pencegahan (*Dual-Action*):** Sistem ini mendukung pencatatan terapi farmakologis standar (Inhaler, Sirup, Oral) maupun sediaan suplemen preventif berbasis herbal lokal (*Aero-Boost Herbal Gummy*) yang berfungsi melindungi mukosa saluran napas sekaligus menjaga efisiensi oksigen ($\text{VO}_2\text{ max}$).
3. **Kolaborasi Pasien & Tenaga Kesehatan:** Menghubungkan pasien secara langsung dengan pendamping (dokter, perawat, apoteker, maupun keluarga) melalui **Kode Pairing / Nomor Rekam Medis (`RM-2026-XXX`)** sehingga pemantauan kepatuhan terapi tidak hanya bergantung pada ingatan pasien semata.

# Fitur Utama

# 1. Portal Terapi Mandiri (Pasien)
**Jadwal Minum Obat & Inhalasi Harian:** Menampilkan daftar obat aktif lengkap dengan jam konsumsi (WIB), bentuk sediaan (*Inhaler*, *Sirup*, *Oral*), serta sisa stok obat secara *real-time*.
**Verifikasi Teknik Pakai 30 Detik:** Panduan interaktif sebelum konfirmasi minum obat untuk memastikan teknik inhalasi maupun konsumsi obat dilakukan secara tepat.
**Reset Jadwal Otomatis Lintas Hari:** Status konsumsi obat otomatis diperbarui setiap pergantian hari (pukul `00.00`) tanpa mengurangi atau mereset sisa stok obat.
**Statistik & Laporan Kepatuhan Harian:** Rekapitulasi persentase kepatuhan terapi, jumlah jadwal tepat waktu, dosis terlewat, serta *streak* hari berturut-turut tanpa henti.
**Alarm Pengingat Audio & Kontak Pendamping:** Fitur uji coba alarm suara dan tombol akses cepat untuk menghubungi pendamping.

# 2. Portal Pendamping (Tenaga Kesehatan & Keluarga)
**Pairing Rekam Medis:** Akses terverifikasi menggunakan kombinasi akun pendamping dan **Kode Pairing Pasien (`RM-2026-XXX`)**.
**Pengaturan Jadwal & Dosis Pasien:** Pendamping dapat menambahkan jenis sediaan obat, mengatur waktu minum (WIB), menentukan takaran dosis, dan mencatat stok awal obat pasien.
**Pemantauan & Laporan Pasien:** Melihat tingkat kepatuhan pasien secara *real-time* serta fitur telepon langsung ke kontak darurat/pasien.

# 3. Antarmuka & Sinkronisasi Cloud
**Sinkronisasi Multi-Perangkat:** Terintegrasi dengan **Supabase** (`respicare_accounts`, `respicare_schedules`, `respicare_login_logs`) dan dukungan penyimpanan lokal (`LocalStorage`).
**Mode Gelap & Mode Terang:** Tema tampilan adaptif yang nyaman digunakan baik di siang maupun malam hari, responsif untuk layar desktop maupun ponsel.

# Teknologi yang Digunakan

| Kategori | Teknologi |
| ----- | ----- |
| **Frontend Framework** | React 18 + Vite |
| **Styling & UI** | Tailwind CSS, Lucide React Icons |
| **Backend & Database** | Supabase (`@supabase/supabase-js`) |
| **State & Persistence** | React Hooks, LocalStorage Sync |
| **Deployment** | Vercel |

# Struktur Proyek

```
respicare-self-manager/
├── public/                 # Aset statis & ikon aplikasi
├── src/
│   ├── components/         # Komponen pendukung (manajemen akun demo/uji coba, modal)
│   ├── lib/
│   │   └── supabase.js     # Konfigurasi klien & koneksi database Supabase
│   ├── App.jsx             # Manajemen state utama, sesi pengguna, & reset jadwal harian
│   ├── Dashboard.jsx       # Antarmuka Portal Pasien & Portal Pendamping
│   ├── Login.jsx           # Halaman autentikasi Pasien & Pendamping (Kode RM)
│   ├── index.css           # Konfigurasi Tailwind CSS & penyesuaian tema
│   └── main.jsx            # Entry point aplikasi React
├── simpan.sh               # Skrip otomatisasi Git add, commit, dan push
├── package.json            # Daftar dependensi & skrip build
└── vite.config.js          # Konfigurasi bundler Vite
```

## Akun Demo Uji Coba

Untuk mencoba fitur aplikasi secara langsung tanpa registrasi baru, tersedia tombol **Akses Cepat Akun Demo** pada halaman masuk:
**Demo Pasien:** Mengakses tampilan *Portal Pasien Mandiri*, konfirmasi minum obat, dan laporan kepatuhan.
**Demo Pendamping:** Mengakses tampilan *Portal Pendamping*, pengaturan jadwal obat pasien, dan pemantauan rekam medis.
## Lisensi

Dikembangkan untuk keperluan edukasi, penelitian kesehatan masyarakat, dan inovasi kefarmasian **RespiCare**.
