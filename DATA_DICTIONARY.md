# Kamus Data (Data Dictionary) — Project "Selaras"

Dokumen ini memuat seluruh variabel telemetri yang dikumpulkan dan dikirim oleh Klien Ekstensi Selaras ke cloud database (Supabase). 

> **Jaminan Privasi Teknis**: Selaras **TIDAK PERNAH** merekam atau mengirimkan frame video/foto webcam, koordinat landmark mentah wajah/pose, teks yang diketik di keyboard (*no keystroke logging*), URL halaman yang dibuka, maupun judul tab. Seluruh komputasi visi berlangsung di perangkat pengguna (*on-device vision*).

---

## 1. Skema Telemetri Per Menit (`signal_minutes`)

Setiap menit aktif, ekstensi menghasilkan tepat 1 baris objek JSON numerik dengan struktur berikut:

| Nama Variabel | Tipe Data | Rentang / Format | Deskripsi & Tujuan Ergonomis | Formula / Sumber Perhitungan |
| :--- | :--- | :--- | :--- | :--- |
| `user_pseudo_id` | `UUID / String` | Pseudonym hash | ID anonim unik pengguna untuk mengaitkan metrik ke akun sendiri. | Dihasilkan dari sesi autentikasi pengguna. |
| `ts_minute` | `Timestamp ISO-8601` | `YYYY-MM-DDTHH:mm:00Z` | Stempel waktu menit agregasi (dibulatkan ke menit). | Jam sistem saat ringkasan 1 menit dikemas. |
| `ear_mean` | `Float` | `0.00` – `1.00` | Nilai rata-rata *Eye Aspect Ratio* (EAR) kedua mata dalam 1 menit. | Rata-rata $\frac{\|p_2-p_6\|+\|p_3-p_5\|}{2\|p_1-p_4\|}$ pada frame yang mendeteksi wajah. |
| `perclos` | `Float` | `0.00` – `1.00` | Proporsi waktu mata tertutup $\ge 80\%$ (EAR $< 0.21$) dalam jendela 60 detik. Indikator utama kelelahan sirkadian / kantuk. | $\frac{\text{Jumlah frame tertutup}}{\text{Total frame valid dalam 60s}}$. Standar P80. |
| `blink_rate` | `Float` | `0` – `120` | Frekuensi kedipan per menit. Kedipan yang jarang menandakan *digital eye strain* (mata kering). | Jumlah transisi buka-tutup mata yang terdeteksi dalam 1 menit. |
| `yawn_count` | `Integer` | `0` – `30` | Jumlah menguap dalam 1 menit. | Dihitung jika Mouth Aspect Ratio (MAR) $\ge 0.60$ bertahan $\ge 2.0$ detik. |
| `head_forward_angle` | `Float` | `0.0` – `90.0` derajat | Sudut condong leher/kepala ke depan relatif terhadap sumbu vertikal (*forward head posture / nerd neck*). | $\arctan\left(\frac{\|\text{ear}.x - \text{shoulder}.x\|}{\|\text{shoulder}.y - \text{ear}.y\|}\right) \times \frac{180}{\pi}$. |
| `shoulder_tilt` | `Float` | `0.0` – `90.0` derajat | Sudut kemiringan bahu terhadap garis horizontal. Indikator postur duduk asimetris/miring. | $\arctan\left(\frac{\|\text{left}.y - \text{right}.y\|}{\|\text{left}.x - \text{right}.x\|}\right) \times \frac{180}{\pi}$. |
| `posture_score` | `Integer` | `0` – `100` | Skor postur relatif terhadap baseline posisi tegak netral personal hasil kalibrasi. | $100 - (\Delta\theta_{\text{head}} \times 1.5 + \Delta\theta_{\text{shoulder}} \times 2.0 + \Delta\text{DistPen})$. |
| `face_present_ratio` | `Float` | `0.00` – `1.00` | Rasio frame dalam 1 menit di mana wajah pengguna terdeteksi di depan layar laptop/PC. | $\frac{\text{Frame wajah terdeteksi}}{\text{Total frame capture di menit tsb}}$. |
| `sitting_continuous_min` | `Integer` | $\ge 0$ menit | Durasi duduk terus-menerus tanpa jeda peregangan. Memicu pengingat 20-20-20 atau peregangan fisik. | Akumulasi menit sejak istirahat terakhir ($> 2$ menit ketiadaan di depan laptop). |
| `idle_sec` | `Integer` | `0` – `60` detik | Jumlah detik dalam menit tersebut saat tidak ada input mouse atau keyboard (`chrome.idle`). | Waktu idle sistem yang terdeteksi browser. |
| `input_events` | `Integer` | $\ge 0$ count | **HANYA JUMLAH KETUKAN**. Total klik mouse + scroll + ketukan tombol keyboard. **Bukan konten kata/huruf.** | Penjumlahan counter lokal content script. |
| `tab_category` | `Enum / Null` | `'work'`, `'communication'`, `'leisure'`, `'other'`, `null` | Kategori kasar tab aktif untuk analisis konteks beban kognitif. **OPT-IN (default: `null`/nonaktif)**. | Pengelompokan domain tingkat tinggi lokal tanpa merekam URL detail. |
| `meeting_mode` | `Boolean` | `true` / `false` | Menandakan pengguna sedang menghadiri rapat daring (kamera vision dijeda, idle tidak dipenalti). | Toggle manual pengguna atau deteksi Google Meet / Zoom tab. |

---

## 2. Skema Survei Mikro Harian (`self_reports`)

Ground-truth label untuk validasi ilmiah dan pelatihan model machine learning, diisi 2x per hari (10 detik):

| Nama Variabel | Tipe | Rentang | Deskripsi Skala |
| :--- | :--- | :--- | :--- |
| `kss_score` | `Integer` | `1` – `9` | **Karolinska Sleepiness Scale**: 1 = Sangat waspada, 5 = Tidak mengantuk/tidak waspada, 9 = Sangat mengantuk, berusaha tetap terjaga. |
| `workload_score` | `Integer` | `1` – `5` | **Beban Kerja Subjektif (Simplified NASA-TLX)**: 1 = Sangat ringan, 5 = Beban kognitif sangat berat. |
| `burnout_item` | `Integer` | `1` – `5` | **Indikator Kelelahan Emosional**: 1 = Sangat segar, 5 = Merasa terkuras/lelah mental akibat pekerjaan hari ini. |

---

## 3. Skema Pelacak Siklus Tugas (`tasks`)

| Nama Variabel | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `title` | `String` | Judul ringkas tugas kerja (misal: "Review PR #42"). |
| `estimated_min` | `Integer` (opsional) | Estimasi waktu penyelesaian (menit). |
| `started_at` | `Timestamp` | Waktu mulai pengerjaan tugas. |
| `completed_at` | `Timestamp` | Waktu tugas ditandai selesai. |
| `cycle_time_sec` | `Integer` | Waktu aktual penyelesaian tugas dalam detik (untuk analisis korelasi kelelahan vs cycle time). |

---

## 4. Jaminan Aksesibilitas Data Karyawan

Setiap variabel di atas dapat dilihat secara langsung dan transparan oleh pengguna melalui:
1. Layar **"What is sent"** di popup / options ekstensi (menampilkan JSON mentah yang dikirim ke Supabase).
2. Menu **"Privacy Center"** di dashboard (fitur Download All My Data dalam format JSON dan CSV).
