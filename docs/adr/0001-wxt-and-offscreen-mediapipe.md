# ADR 0001: Pilihan Framework Ekstensi (WXT) & Pipeline Visi On-Device (Offscreen Document)

## Status
Diterima (Accepted)

## Konteks
Arsitektur Chrome / Edge Manifest V3 (MV3) tidak mengizinkan Service Worker mengakses DOM atau API kamera (`navigator.mediaDevices.getUserMedia`). Selain itu, aturan MV3 melarang pemuatan skrip jarak jauh (*remote hosted code*). Selaras membutuhkan:
1. Akses kamera lokal yang aman dan transparan untuk deteksi kelelahan dan postur tubuh.
2. Penanganan model MediaPipe Tasks Vision (`.task` dan WASM) yang dibundel 100% secara lokal.
3. Struktur modular dan ramah pengembang untuk integrasi monorepo dengan TypeScript dan Tailwind CSS.

Opsi yang dievaluasi:
- **Plasmo**: Populer untuk MV3, namun memiliki opini struktur folder yang kaku dan dukungan integrasi file WASM/asset biner lokal yang sering memerlukan patch kustom.
- **Vite + @crxjs/vite-plugin**: Fleksibel namun memerlukan konfigurasi manual yang cukup rumit untuk mengelola siklus hidup *Offscreen Document*.
- **WXT (Web Extension Tools)**: Dibangun di atas Vite, menyediakan dukungan *native* pertama untuk `wxt/browser` offscreen documents, otomatisasi manifest, dan penanganan aset statis biner yang sangat baik.

## Keputusan
Kami memilih **WXT (Web Extension Tools)** dengan framework UI React dan Tailwind CSS, serta menjalankan pipeline visi `@mediapipe/tasks-vision` di dalam **Offscreen Document**.

## Konsekuensi
- **Positif**:
  - Pemuatan aset model `.task` dan WASM terlokalisasi di dalam paket ekstensi, memenuhi aturan ketat MV3 tanpa ketergantungan CDN eksternal.
  - Offscreen document dapat dibuka dan ditutup sesuai kebutuhan, membebaskan memori browser saat pemantauan dijeda.
  - Komunikasi antara Offscreen Document dan Service Worker terisolasi hanya pada pengiriman pesan numerik (*numeric messages*).
- **Mitigasi**:
  - Untuk menjaga kinerja CPU di bawah 5%, resolusi webcam dibatasi ke $320 \times 240$ dan frame rate diatur adaptif (2–5 fps).
