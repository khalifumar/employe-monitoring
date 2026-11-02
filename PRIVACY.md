# Kebijakan & Arsitektur Privasi (Privacy Architecture) — "Selaras"

Sistem **Selaras** dibangun dengan filosofi **Privacy-by-Design** sebagai prinsip rekayasa perangkat lunak yang mutlak. Selaras adalah asisten kesejahteraan digital (_supportive wellbeing assistant_), **BUKAN** alat pengawasan karyawan (_employee surveillance_).

---

## 1. Tujuh Invarian Privasi (Non-Negotiable Privacy Invariants)

1. **On-Device Vision (Zero Image Transmission)**:
   Frame video webcam, citra pengguna, dan koordinat landmark wajah atau pose tubuh diproses murni di memori lokal (_sandbox offscreen document_). Frame tidak pernah disimpan ke hard disk dan **TIDAK PERNAH dikirim melalui jaringan internet**.
2. **Telemetri Numerik Agregat 1 Menit**:
   Hanya 1 objek numerik ringkas per menit yang dikirim ke server. Server hanya menerima rata-rata metrik ergonomis (seperti EAR rata-rata, PERCLOS, rasio kehadiran wajah, dan jumlah ketukan), bukan rekaman kontinu per detik.
3. **No Keystroke Logging & No URL Surveillance**:
   Sistem tidak pernah membaca, mencatat, atau menyimpan konten teks yang diketik pengguna, kata sandi, URL lengkap yang dikunjungi, maupun judul halaman web. Yang dicatat hanyalah frekuensi ketukan (_input counts_) untuk mendeteksi ritme interaksi. Kategori tab (kerja vs santai) bersifat opsional (_opt-in_) dan dinonaktifkan secara _default_.
4. **Persetujuan Otonom Karyawan (Autonomous Consent)**:
   Pemantauan dan akses kamera hanya dapat aktif jika karyawan memberikan persetujuan eksplisit secara granular melalui antarmuka ekstensi. **Pemberi kerja, manajer, atau administrator sistem TIDAK BISA mengaktifkan kamera atau pemantauan dari jarak jauh (_remote activation is impossible_)**.
5. **Ketiadaan Peringkat Karyawan (No Punitive Rankings / Leaderboards)**:
   Tidak ada fitur peringkat karyawan, papan skor produktivitas, atau daftar "karyawan paling tidak fokus". Selaras berfokus pada pencegahan cedera fisik ergonomis dan kelelahan mental, bukan menghakimi performa kerja.
6. **Perlindungan k-Anonymity Tingkat Database ($k \ge 5$)**:
   Manajer dan pimpinan organisasi hanya dapat melihat metrik kesehatan dalam bentuk agregat level tim. Data agregat tersebut **hanya ditampilkan jika tim memiliki minimal 5 orang anggota aktif** ($k \ge 5$). Hal ini mencegah manajer menyimpulkan identitas individu di tim kecil. Data individu hanya bisa dilihat manajer jika karyawan tersebut secara sadar dan sukarela mengaktifkan toggle _opt-in_ berbagi data.
7. **Keamanan Row Level Security (RLS) & Tanpa Akses Kunci Rahasia**:
   Seluruh akses database dilindungi oleh kebijakan PostgreSQL Row Level Security (RLS). Kunci `service-role` tidak pernah disimpan di aplikasi frontend, ekstensi, maupun repositori publik.

---

## 2. Matriks Transparansi: "Siapa Dapat Melihat Apa?"

| Jenis Data                                                              |      Karyawan Pemilik      |   Rekan Kerja    |             Manajer Tim             | Pimpinan Org / Admin |
| :---------------------------------------------------------------------- | :------------------------: | :--------------: | :---------------------------------: | :------------------: |
| **Frame Kamera / Foto**                                                 | _Tidak disimpan siapa pun_ | ❌ Tidak Pernah  |           ❌ Tidak Pernah           |   ❌ Tidak Pernah    |
| **Teks yang Diketik / URL**                                             | _Tidak dicatat siapa pun_  | ❌ Tidak Pernah  |           ❌ Tidak Pernah           |   ❌ Tidak Pernah    |
| **Linimasa Postur & Kantuk Pribadi**                                    |       ✅ Akses Penuh       |  ❌ Tidak Bisa   | ❌ _(Kecuali jika Karyawan Opt-in)_ |    ❌ Tidak Bisa     |
| **Agregat Tim ($k \ge 5$)**                                             |      ✅ Dapat Melihat      | ✅ Dapat Melihat |          ✅ Dapat Melihat           |   ✅ Dapat Melihat   |
| **Saran Kesejahteraan Tim** (misal: "Disarankan mengurangi rapat sore") |      ✅ Dapat Melihat      | ✅ Dapat Melihat |          ✅ Dapat Melihat           |   ✅ Dapat Melihat   |

---

## 3. Hak Pengguna Atas Data (Data Subject Rights)

Sesuai dengan prinsip kepatuhan perlindungan data (seperti GDPR dan UU Perlindungan Data Pribadi / UU PDP):

1. **Hak untuk Mengetahui (Right to Transparent Access)**:
   Layar _"What is sent"_ di ekstensi menampilkan secara _real-time_ struktur JSON persis yang dikirimkan ke cloud backend.
2. **Hak Portabilitas Data (Right to Data Portability)**:
   Pengguna dapat mengunduh seluruh data riwayat kesejahteraan pribadinya kapan saja dalam format standar CSV atau JSON melalui menu _Privacy Center_ di dashboard web.
3. **Hak untuk Dilupakan (Right to Erasure / Right to be Forgotten)**:
   Pengguna memiliki tombol satu-klik _"Hapus Seluruh Data Saya"_. Tindakan ini secara permanen menghapus seluruh baris telemetri dan log tugas milik pengguna dari basis data Supabase tanpa masa tunggu.
4. **Retensi Terbatas Otomatis (90-Day Retention Policy)**:
   Data telemetri menit mentah (`signal_minutes`) secara otomatis dihapus permanen oleh sistem setelah 90 hari menggunakan PostgreSQL `pg_cron`. Hanya data statistik agregat bulanan yang disimpan untuk tren jangka panjang.
