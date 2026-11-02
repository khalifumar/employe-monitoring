-- ==============================================================================
-- PROJECT "SELARAS" — INITIAL SCHEMA MIGRATION
-- ==============================================================================

-- In PostgreSQL 13+, gen_random_uuid() is built-in natively.
-- Attempt to load uuid-ossp if available, or continue natively.
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 1. Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Teams
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. User Profiles (Extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Team Memberships
CREATE TABLE team_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_team_member UNIQUE (team_id, user_id)
);

-- 5. Consents (Granular, Revocable per Signal)
CREATE TABLE consents (
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

-- 6. Signal Minutes (Aggregated 1-Minute Numeric Telemetry Only)
-- Raw camera frames, images, face/pose landmarks, key content, URLs NEVER stored.
CREATE TABLE signal_minutes (
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

CREATE INDEX idx_signal_minutes_user_ts ON signal_minutes(user_id, ts_minute DESC);
CREATE INDEX idx_signal_minutes_team_ts ON signal_minutes(team_id, ts_minute DESC);

-- 7. Task Timer & Cycle Time
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    estimated_min INTEGER CHECK (estimated_min > 0 OR estimated_min IS NULL),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    cycle_time_sec INTEGER CHECK (cycle_time_sec >= 0 OR cycle_time_sec IS NULL),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user ON tasks(user_id, started_at DESC);

-- 8. Micro Self-Reports (Ground-Truth Labels: KSS 1-9, Workload 1-5, Burnout 1-5)
CREATE TABLE self_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    kss_score INTEGER NOT NULL CHECK (kss_score >= 1 AND kss_score <= 9),
    workload_score INTEGER NOT NULL CHECK (workload_score >= 1 AND workload_score <= 5),
    burnout_item INTEGER NOT NULL CHECK (burnout_item >= 1 AND burnout_item <= 5),
    is_synthetic BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_self_reports_user ON self_reports(user_id, ts DESC);

-- 9. Risk Scores (Computed by Batch ML Worker)
CREATE TABLE risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    fatigue_risk_level TEXT NOT NULL CHECK (fatigue_risk_level IN ('low', 'moderate', 'high')),
    focus_indicator_level TEXT NOT NULL CHECK (focus_indicator_level IN ('steady', 'fluctuating', 'low')),
    top_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_date_hour UNIQUE (user_id, date, hour)
);

CREATE INDEX idx_risk_scores_team ON risk_scores(team_id, date DESC, hour DESC);

-- 10. Audit Log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
