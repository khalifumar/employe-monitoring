# Selaras (Harmoni Kesejahteraan & Fokus Kerja Digital)

> **Asisten Kesejahteraan & Analisis Fokus Tim Berbasis AI dengan Arsitektur Privacy-by-Design**

Selaras adalah platform pemantauan ergonomi dan ritme kerja digital yang dirancang untuk mendeteksi tanda kelelahan (*fatigue*), postur tubuh buruk (*slouching / forward neck*), durasi duduk tanpa jeda, dan fluktuasi fokus. 

Selaras dibangun berlandaskan filosofi **"Supportive Wellbeing Assistant"**, **bukan alat pengawasan atau mata-mata karyawan (*employee surveillance*)**.

---

## 🔒 Jaminan Privasi (Privacy Invariants)

1. **Visi On-Device**: Frame webcam dan citra wajah diproses 100% secara lokal di browser ekstensi (*sandbox offscreen document*). **Frame tidak pernah disimpan dan tidak pernah dikirim ke internet.**
2. **Tanpa Keylogger & URL Tracker**: Tidak pernah merekam isi ketikan keyboard, URL halaman, atau judul tab. Hanya frekuensi kejadian interaksi (*counts only*).
3. **Persetujuan Granular Otonom**: Karyawan memegang kendali penuh atas sensor apa saja yang aktif. Manajer tidak dapat mengaktifkan pemantauan secara remote.
4. **k-Anonymity Terjamin ($k \ge 5$)**: Manajer hanya dapat melihat ringkasan agregat tim jika ukuran tim minimal 5 orang.
5. **Tanpa Peringkat Hukuman**: Tidak ada *leaderboard* performa atau daftar "karyawan paling tidak produktif".
6. **Hak Hapus Data & Retensi Terbatas**: Data telemetri mentah otomatis dibersihkan setelah 90 hari. Pengguna dapat mengunduh atau menghapus seluruh datanya dengan satu klik.

Baca dokumen lengkap: [PRIVACY.md](PRIVACY.md) dan [DATA_DICTIONARY.md](DATA_DICTIONARY.md).

---

## 🏗️ Struktur Repositori (pnpm Monorepo)

```
selaras/
├── apps/
│   ├── extension/         # Ekstensi Chrome/Edge Manifest V3 (WXT + React + MediaPipe)
│   └── dashboard/         # Dashboard Analitik Web (Next.js 15 App Router + shadcn/ui)
├── packages/
│   └── shared/            # Kontrak tipe TypeScript, Zod schemas, dan formula matematika sinyal
├── supabase/              # Migrasi database PostgreSQL, RLS policies, seed data
├── ml/                    # Notebook riset Python (Google Colab), skrip batch scoring, dan model ML
├── docs/                  # Arsitektur sistem dan Architectural Decision Records (ADRs)
└── .github/workflows/     # CI/CD, batch scoring cron, dan Supabase keep-alive
```

---

## ⚡ Panduan Setup Cepat (< 15 Menit)

### Prasyarat
- **Node.js**: $\ge 20.0.0$
- **pnpm**: $\ge 9.0.0$ (instal melalui `npm install -g pnpm`)
- **Git**
- Browser berbasis Chromium (Google Chrome atau Microsoft Edge versi $\ge 116$)

### 1. Kloning Repositori & Instal Dependensi
```bash
git clone <repository-url>
cd 27-employe-monitoring
pnpm install
```

### 2. Jalankan Pengujian Otomatis Paket Shared (Signal Math)
```bash
pnpm --filter @selaras/shared test
```
*Seluruh 42 unit test matematis (EAR, PERCLOS, MAR, Posture Score, Z-Score, Focus Indicator) akan tervalidasi 100%.*

### 3. Konfigurasi Lingkungan (.env)
Salin berkas konfigurasi contoh:
```bash
cp .env.example .env.local
```
*(Catatan: Anda dapat langsung menjalankan dashboard dalam **Demo Mode** tanpa menghubungkan Supabase cloud dengan menetapkan `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`)*.

### 4. Menjalankan Dashboard Analitik Web
```bash
pnpm --filter @selaras/dashboard dev
```
Buka peramban di `http://localhost:3000`.

### 5. Menjalankan Browser Extension (Mode Pengembangan)
```bash
pnpm --filter @selaras/extension dev
```
Buka browser:
1. Akses `chrome://extensions` di Google Chrome atau `edge://extensions` di Microsoft Edge.
2. Aktifkan **Developer mode** di sudut kanan atas.
3. Klik tombol **Load unpacked** dan pilih direktori `apps/extension/.output/chrome-mv3`.

---

## 📚 Dokumentasi Terkait

- [Arsitektur Sistem Detail](ARCHITECTURE.md)
- [Kebijakan Privasi & Invarian Teknis](PRIVACY.md)
- [Kamus Data Telemetri](DATA_DICTIONARY.md)
- [Catatan Keputusan Arsitektur (ADRs)](docs/adr/)
  - [ADR 0001: WXT & MediaPipe Offscreen Document](docs/adr/0001-wxt-and-offscreen-mediapipe.md)
  - [ADR 0002: Penegakan k-Anonymity (k >= 5)](docs/adr/0002-k-anonymity-enforcement.md)
  - [ADR 0003: Batch Scoring Berbiaya Nol](docs/adr/0003-zero-cost-scoring-pipeline.md)

---

## 📄 Lisensi
Proyek riset tesis ini dirilis di bawah lisensi **MIT**. Seluruh komponen pustaka pihak ketiga menggunakan lisensi open-source ramah riset (MIT, Apache-2.0, BSD).
