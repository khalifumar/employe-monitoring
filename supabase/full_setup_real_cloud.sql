-- ==============================================================================
-- PROJECT "SELARAS" — COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- Copy-paste seluruh script ini ke SQL Editor di Dashboard Supabase Cloud Anda.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP EXISTING (IF NEEDED FOR CLEAN SETUP)
DROP VIEW IF EXISTS team_wellbeing_hourly_view CASCADE;
DROP VIEW IF EXISTS team_wellbeing_daily_view CASCADE;

-- 3. CORE TABLES
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_team_member UNIQUE (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    signal_type TEXT NOT NULL CHECK (
        signal_type IN (
            'drowsiness',
            'posture',
            'activity',
            'task_timer',
            'tab_category',
            'manager_individual_view'
        )
    ),
    granted BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_signal UNIQUE (user_id, signal_type)
);

-- Signal Minutes (Per-minute aggregated numbers only, NO images/landmarks)
CREATE TABLE IF NOT EXISTS signal_minutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    ts_minute TIMESTAMPTZ NOT NULL,
    ear_mean REAL NOT NULL CHECK (ear_mean >= 0.0 AND ear_mean <= 1.0),
    perclos REAL NOT NULL CHECK (perclos >= 0.0 AND perclos <= 1.0),
    blink_rate REAL NOT NULL CHECK (blink_rate >= 0.0 AND blink_rate <= 120.0),
    yawn_count INTEGER NOT NULL CHECK (yawn_count >= 0 AND yawn_count <= 30),
    head_forward_angle REAL NOT NULL CHECK (head_forward_angle >= -90.0 AND head_forward_angle <= 90.0),
    shoulder_tilt REAL NOT NULL CHECK (shoulder_tilt >= 0.0 AND shoulder_tilt <= 90.0),
    posture_score INTEGER NOT NULL CHECK (posture_score >= 0 AND posture_score <= 100),
    face_present_ratio REAL NOT NULL CHECK (face_present_ratio >= 0.0 AND face_present_ratio <= 1.0),
    sitting_continuous_min INTEGER NOT NULL CHECK (sitting_continuous_min >= 0),
    idle_sec INTEGER NOT NULL CHECK (idle_sec >= 0 AND idle_sec <= 60),
    input_events INTEGER NOT NULL CHECK (input_events >= 0),
    tab_category TEXT CHECK (tab_category IN ('work', 'communication', 'leisure', 'other') OR tab_category IS NULL),
    meeting_mode BOOLEAN NOT NULL DEFAULT false,
    is_synthetic BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signal_minutes_user_ts ON signal_minutes(user_id, ts_minute DESC);
CREATE INDEX IF NOT EXISTS idx_signal_minutes_team_ts ON signal_minutes(team_id, ts_minute DESC);

-- Sesi Kerja Tim (Co-working Session yang diaktifkan Manager)
CREATE TABLE IF NOT EXISTS team_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Sesi Kerja Tim',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    estimated_min INTEGER,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 4. K-ANONYMITY VIEWS (k >= 5)
CREATE OR REPLACE VIEW team_wellbeing_hourly_view AS
SELECT 
    team_id,
    date_trunc('hour', ts_minute) AS hour_bucket,
    COUNT(DISTINCT user_id) AS active_members_count,
    ROUND(AVG(ear_mean)::numeric, 4) AS avg_ear_mean,
    ROUND(AVG(perclos)::numeric, 4) AS avg_perclos,
    ROUND(AVG(blink_rate)::numeric, 2) AS avg_blink_rate,
    ROUND(AVG(head_forward_angle)::numeric, 2) AS avg_head_forward_angle,
    ROUND(AVG(shoulder_tilt)::numeric, 2) AS avg_shoulder_tilt,
    ROUND(AVG(posture_score)::numeric, 1) AS avg_posture_score,
    ROUND(AVG(sitting_continuous_min)::numeric, 1) AS avg_sitting_min,
    ROUND(AVG(face_present_ratio)::numeric, 3) AS avg_face_present_ratio,
    SUM(input_events) AS total_input_events,
    SUM(yawn_count) AS total_yawns,
    true AS k_anonymity_satisfied
FROM signal_minutes
GROUP BY team_id, date_trunc('hour', ts_minute)
HAVING COUNT(DISTINCT user_id) >= 5;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_sessions ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION get_auth_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_manager_or_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('manager', 'admin') FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Policies for public / authenticated app access
CREATE POLICY "Public read for organizations" ON organizations FOR SELECT TO public USING (true);
CREATE POLICY "Public read for teams" ON teams FOR SELECT TO public USING (true);
CREATE POLICY "Public read for profiles" ON profiles FOR SELECT TO public USING (true);
CREATE POLICY "Public read for team_memberships" ON team_memberships FOR SELECT TO public USING (true);
CREATE POLICY "Public read/write for team_sessions" ON team_sessions FOR ALL TO public USING (true);
CREATE POLICY "Public insert for signal_minutes" ON signal_minutes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public select for signal_minutes" ON signal_minutes FOR SELECT TO public USING (true);

-- 6. DEFAULT INITIAL SEED DATA (Termasuk akun Manager & Karyawan)
INSERT INTO organizations (id, name)
VALUES ('11111111-1111-1111-1111-111111111111', 'PT Nusantara Dinamika')
ON CONFLICT (id) DO NOTHING;

INSERT INTO teams (id, org_id, name)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Tim Engineering Core (k=6)'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Tim Mobile R&D (k=3)')
ON CONFLICT (id) DO NOTHING;

-- Catatan: Untuk auth.users, pengguna akan mendaftar/login via Supabase Auth atau menggunakan akun Anda.
