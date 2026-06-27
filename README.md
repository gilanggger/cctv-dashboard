# CCTV Monitoring App

Aplikasi pemantau kamera CCTV berbasis Vue 3 + Vite + WebRTC (WHEP).

## Struktur File

```
cctv-dashboard-app/
├── index.html                   ← Entry point HTML
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
│
└── src/
    ├── main.js                  ← Bootstrap Vue + Pinia + Router
    ├── App.vue                  ← Root komponen (hanya <RouterView>)
    ├── style.css                ← Global CSS + Tailwind
    ├── cameras.js                ← ★ DAFTAR SEMUA KAMERA — edit di sini
    │
    ├── stores/
    │   └── auth.js               ← ★ Daftar user & login logic (Pinia)
    │
    ├── router/
    │   └── index.js              ← Route + auth guard otomatis
    │
    ├── components/
    │   ├── AppTopBar.vue         ← Top bar shared (jam, user, logout)
    │   └── CameraCard.vue        ← Mini player per kamera di grid
    │
    └── views/
        ├── LoginView.vue         ← /login
        ├── DashboardView.vue     ← /dashboard (grid multi-kamera)
        ├── CameraView.vue        ← /camera/:id (fullscreen 1 kamera)
        └── ManageView.vue        ← halaman kelola kamera
```

## Cara Menjalankan

```bash
# 1. Masuk ke folder proyek
cd cctv-dashboard-app

# 2. Install dependensi
npm install

# 3. Jalankan dev server
npm run dev

# 4. Buka browser
#    http://localhost:5173
```

## File `.env`

File ini berisi konfigurasi host & port server, dan **tidak ikut di-push ke GitHub** (sudah masuk `.gitignore`). Pastikan file ini tetap ada di folder kamu:

```
host=0.0.0.0
port=8080
```

## Menambah / Mengubah Kamera

Edit `src/cameras.js` — tambahkan objek baru ke array `CAMERAS` sesuai kamera yang ingin ditambahkan.

## Menambah / Mengubah User Login

Edit `src/stores/auth.js` — tambahkan objek baru ke array `USERS`.

> **Produksi:** ganti blok USERS dengan API call ke backend (REST/JWT).

## Build untuk Produksi

```bash
npm run build
# Output di folder dist/ — upload ke web server / nginx
```
