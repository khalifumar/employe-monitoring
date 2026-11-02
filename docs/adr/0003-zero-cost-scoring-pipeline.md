# ADR 0003: Pipeline Skoring Batch Berbiaya Nol (Zero-Cost Compute via GitHub Actions)

## Status

Diterima (Accepted)

## Konteks

Proyek tugas akhir/tesis memiliki batasan anggaran operasional yang ketat: harus memanfaatkan tier gratis (_free tiers_) yang stabil dan tidak menimbulkan tagihan bulanan tidak terduga. Menjalankan server inferensi ML mandiri (seperti AWS EC2, GCP Compute Engine, atau dedicated Python container) membutuhkan biaya berlangganan.

## Keputusan

Memanfaatkan kuota gratis **GitHub Actions** (2,000 menit komputasi gratis per bulan) untuk menjalankan skrip inferensi batch terjadwal (`cron`).

### Mekanisme Kerja:

1. Workflow GitHub Actions dijalankan secara terjadwal (misalnya setiap jam pada hari kerja).
2. Worker GitHub Actions (Ubuntu latest) menginstal dependensi Python ringan (`pandas`, `scikit-learn`, `xgboost`, `shap`, `joblib`).
3. Skrip membaca data agregat per jam dari Supabase menggunakan token autentikasi rahasia (_Repository Secret_).
4. Skrip melakukan normalisasi $z$-score, menghitung probabilitas risiko kelelahan dan nilai SHAP untuk atribusi faktor utama, lalu menuliskan hasilnya kembali ke tabel `risk_scores`.
5. Waktu eksekusi rata-rata per batch diperkirakan $< 90$ detik. Dengan 1–2 pemanggilan per hari atau per jam kerja, total konsumsi waktu berkisar antara 60–100 menit per bulan, jauh di bawah kuota gratis 2,000 menit.

## Konsekuensi

- **Positif**:
  - Biaya komputasi backend = \$0 (nol rupiah).
  - Tidak ada infrastruktur server yang perlu dimonitor atau ditambal keamanannya secara manual.
  - Model inferensi mudah diuji ulang secara lokal menggunakan skrip CLI yang sama.
- **Batasan**:
  - Penilaian risiko bersifat periodik/batch (misal per jam atau harian), bukan _real-time stream inference_. Hal ini justru selaras dengan tujuan analitik tren jangka menengah dan menjaga ketenangan pengguna (_calm technology_).
