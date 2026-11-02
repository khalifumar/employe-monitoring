-- ==============================================================================
-- PROJECT "SELARAS" — PROFILES & TELEMETRY CONSTRAINT PATCH
-- Jalankan 8 baris ini di SQL Editor Supabase untuk mengizinkan input data riil
-- ==============================================================================

-- 1. Lepas constraint foreign key ke auth.users agar profile lokal bisa langsung aktif
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE signal_minutes DROP CONSTRAINT IF EXISTS signal_minutes_user_id_fkey;

-- 2. Daftarkan profil Manajer dan Karyawan
INSERT INTO profiles (id, org_id, full_name, role)
VALUES 
    ('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Khalif Umar (Manajer)', 'manager'),
    ('10000000-0000-0000-0000-000000000098', '11111111-1111-1111-1111-111111111111', 'Khalif Umar (Karyawan)', 'employee')
ON CONFLICT (id) DO NOTHING;

-- 3. Hubungkan ke Tim Engineering Core
INSERT INTO team_memberships (team_id, user_id)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10000000-0000-0000-0000-000000000001'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10000000-0000-0000-0000-000000000098')
ON CONFLICT DO NOTHING;
