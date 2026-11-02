# ADR 0002: Penegakan k-Anonymity (k ≥ 5) di Tingkat Database View & RLS

## Status

Diterima (Accepted)

## Konteks

Salah satu risiko terbesar dalam implementasi sistem analitik di tempat kerja adalah penyalahgunaan data oleh manajer untuk mengawasi atau menghukum individu tertentu. Jika tim hanya beranggotakan 2 atau 3 orang, data agregat rata-rata dapat dengan mudah digunakan untuk merekonstruksi perilaku satu individu (misalnya jika hanya ada 1 orang yang bekerja di jam tertentu).

## Keputusan

1. Menerapkan aturan matematis $k$-anonymity dengan ambang batas minimal $k = 5$.
2. Penegakan $k$-anonymity **TIDAK DILAKUKAN di tingkat antarmuka klien (frontend)** semata, melainkan ditegakkan langsung di lapisan **PostgreSQL View dan Row Level Security (RLS)** di Supabase:
   ```sql
   CREATE OR REPLACE VIEW team_wellbeing_hourly_view AS
   SELECT
     team_id,
     date_trunc('hour', ts_minute) AS hour_bucket,
     COUNT(DISTINCT user_id) AS active_members_count,
     AVG(perclos) AS avg_perclos,
     AVG(posture_score) AS avg_posture_score,
     AVG(sitting_continuous_min) AS avg_sitting_min,
     SUM(input_events) AS total_events
   FROM signal_minutes
   GROUP BY team_id, date_trunc('hour', ts_minute)
   HAVING COUNT(DISTINCT user_id) >= 5; -- Ditegakkan di database
   ```
3. Manajer dilarang melakukan query `SELECT` langsung pada tabel baris mentah `signal_minutes`.
4. Karyawan memiliki kendali penuh: data individu hanya dapat dibagikan kepada manajer jika karyawan secara eksplisit memilih opsi _opt-in_ di pengaturan persetujuan (_consent_).

## Konsekuensi

- **Positif**:
  - Kebocoran privasi tim kecil dicegah secara matematis dan terstruktur di level data engine.
  - Klien tidak dapat membypass aturan privasi meskipun memodifikasi query GraphQL/REST API.
- **Batasan**:
  - Tim rintisan (_startup_) atau departemen kecil dengan $< 5$ anggota tidak akan melihat metrik agregat tim sampai ukuran tim mencukupi batas minimal. Dashboard akan menampilkan kartu status edukatif: _"Jumlah anggota tim aktif belum mencapai batas k-anonymity (min. 5 orang)"_.
