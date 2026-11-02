-- ==============================================================================
-- PROJECT "SELARAS" — SEED SCRIPT (SYNTHETIC DEMO DATA)
-- Label: SEMUA DATA ADALAH DATA SINTETIS (FOR TESTING, DEMO & THESIS EVALUATION)
-- ==============================================================================

-- 1. Create Demo Users in auth.users (Mock auth records for testing)
-- In production Supabase, these are created by Supabase Auth service.
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization 1: PT Nusantara Dinamika
INSERT INTO organizations (id, name, created_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'PT Nusantara Dinamika (Org 1)', NOW() - INTERVAL '30 days'),
    ('22222222-2222-2222-2222-222222222222', 'Aksara Solusindo (Org 2 - Cross Org Test)', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- Teams
-- Team 1: Frontend Squad (6 members -> Satisfies k >= 5 anonymity rule)
-- Team 2: Mobile Squad (3 members -> Fails k >= 5, hidden from manager aggregate)
-- Team 3: Data Core (Org 2 team -> For cross-org boundary testing)
INSERT INTO teams (id, org_id, name, created_at)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Tim Frontend Engineering (k=6)', NOW() - INTERVAL '30 days'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Tim Mobile App (k=3, Below Threshold)', NOW() - INTERVAL '30 days'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Tim Data Core Aksara (Org 2)', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- Mock Users & Profiles
-- Users 1 to 6: Members of Team 1
-- User 1 is also Manager of Team 1
INSERT INTO auth.users (id, email) VALUES
    ('10000000-0000-0000-0000-000000000001', 'budi.santoso@nusantara.id'),
    ('10000000-0000-0000-0000-000000000002', 'citra.dewi@nusantara.id'),
    ('10000000-0000-0000-0000-000000000003', 'ahmad.rizky@nusantara.id'),
    ('10000000-0000-0000-0000-000000000004', 'eka.putri@nusantara.id'),
    ('10000000-0000-0000-0000-000000000005', 'fajar.nugraha@nusantara.id'),
    ('10000000-0000-0000-0000-000000000006', 'gita.maharani@nusantara.id'),
    -- Team 2 (Small team, 3 members)
    ('20000000-0000-0000-0000-000000000001', 'hendra.wijaya@nusantara.id'),
    ('20000000-0000-0000-0000-000000000002', 'intan.permata@nusantara.id'),
    ('20000000-0000-0000-0000-000000000003', 'joko.susilo@nusantara.id'),
    -- Org 2 Member
    ('30000000-0000-0000-0000-000000000001', 'siti.nurhaliza@aksara.id')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, org_id, full_name, role) VALUES
    ('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Budi Santoso', 'manager'),
    ('10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Citra Dewi', 'employee'),
    ('10000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Ahmad Rizky', 'employee'),
    ('10000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Eka Putri', 'employee'),
    ('10000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Fajar Nugraha', 'employee'),
    ('10000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Gita Maharani', 'employee'),
    ('20000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Hendra Wijaya', 'manager'),
    ('20000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Intan Permata', 'employee'),
    ('20000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Joko Susilo', 'employee'),
    ('30000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Siti Nurhaliza', 'employee')
ON CONFLICT (id) DO NOTHING;

-- Team Memberships
INSERT INTO team_memberships (team_id, user_id) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10000000-0000-0000-0000-000000000001'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10000000-0000-0000-0000-000000000002'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10000000-0000-0000-0000-000000000003'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10000000-0000-0000-0000-000000000004'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10000000-0000-0000-0000-000000000005'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10000000-0000-0000-0000-000000000006'),
    -- Team 2 (3 members)
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '20000000-0000-0000-0000-000000000001'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '20000000-0000-0000-0000-000000000002'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '20000000-0000-0000-0000-000000000003'),
    -- Team 3 (Org 2)
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '30000000-0000-0000-0000-000000000001')
ON CONFLICT (team_id, user_id) DO NOTHING;

-- Consents Setup
-- Ahmad Rizky (user 3) grants manager individual view (opted-in)
-- Others opt-out of manager individual view
INSERT INTO consents (user_id, signal_type, granted) VALUES
    ('10000000-0000-0000-0000-000000000002', 'drowsiness', true),
    ('10000000-0000-0000-0000-000000000002', 'posture', true),
    ('10000000-0000-0000-0000-000000000002', 'activity', true),
    ('10000000-0000-0000-0000-000000000002', 'manager_individual_view', false),
    ('10000000-0000-0000-0000-000000000003', 'drowsiness', true),
    ('10000000-0000-0000-0000-000000000003', 'posture', true),
    ('10000000-0000-0000-0000-000000000003', 'activity', true),
    ('10000000-0000-0000-0000-000000000003', 'manager_individual_view', true) -- Opted in
ON CONFLICT (user_id, signal_type) DO NOTHING;

-- Seed Synthetic Minute Telemetry
-- Generate realistic workday hours (09:00, 10:00, 11:00, 14:00, 15:00, 16:00)
-- for all 6 members of Team 1 on 2026-11-02
DO $$
DECLARE
    u_id UUID;
    t_hour INT;
    m_offset INT;
    ts_point TIMESTAMPTZ;
    v_perclos REAL;
    v_posture INT;
    v_events INT;
    v_yawn INT;
BEGIN
    FOR u_id IN 
        SELECT id FROM profiles WHERE id IN (
            '10000000-0000-0000-0000-000000000001',
            '10000000-0000-0000-0000-000000000002',
            '10000000-0000-0000-0000-000000000003',
            '10000000-0000-0000-0000-000000000004',
            '10000000-0000-0000-0000-000000000005',
            '10000000-0000-0000-0000-000000000006'
        )
    LOOP
        -- Work hours: 09:00 to 17:00
        FOR t_hour IN 9..17 LOOP
            IF t_hour <> 12 THEN -- Lunch hour break
                FOR m_offset IN 0..2 LOOP -- 3 sample minutes per hour
                    ts_point := ('2026-11-02 ' || t_hour || ':' || (m_offset * 20) || ':00+07')::timestamptz;
                    
                    -- Circadian rhythm simulation:
                    -- Fatigue rises in mid-afternoon (hours 14-16)
                    IF t_hour IN (14, 15, 16) THEN
                        v_perclos := 0.16 + (random() * 0.08); -- Mild to moderate fatigue
                        v_posture := 65 + (random() * 15)::INT; -- Slouching increases
                        v_events := 35 + (random() * 30)::INT;
                        v_yawn := CASE WHEN random() > 0.75 THEN 1 ELSE 0 END;
                    ELSE
                        v_perclos := 0.04 + (random() * 0.04); -- Fresh / alert
                        v_posture := 85 + (random() * 14)::INT; -- Upright
                        v_events := 60 + (random() * 40)::INT;
                        v_yawn := 0;
                    END IF;

                    INSERT INTO signal_minutes (
                        user_id,
                        team_id,
                        ts_minute,
                        ear_mean,
                        perclos,
                        blink_rate,
                        yawn_count,
                        head_forward_angle,
                        shoulder_tilt,
                        posture_score,
                        face_present_ratio,
                        sitting_continuous_min,
                        idle_sec,
                        input_events,
                        tab_category,
                        meeting_mode,
                        is_synthetic
                    ) VALUES (
                        u_id,
                        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                        ts_point,
                        0.32 - (v_perclos * 0.4),
                        v_perclos,
                        16.0 + (random() * 6.0),
                        v_yawn,
                        14.0 + (100 - v_posture) * 0.3,
                        3.0 + (random() * 4.0),
                        v_posture,
                        0.95,
                        m_offset * 25,
                        5,
                        v_events,
                        'work',
                        false,
                        true -- SYNTHETIC DATA LABEL
                    );
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;

    -- Also insert 3 sample records for Team 2 (3 members -> fails k>=5)
    FOR u_id IN 
        SELECT id FROM profiles WHERE id IN (
            '20000000-0000-0000-0000-000000000001',
            '20000000-0000-0000-0000-000000000002',
            '20000000-0000-0000-0000-000000000003'
        )
    LOOP
        INSERT INTO signal_minutes (
            user_id,
            team_id,
            ts_minute,
            ear_mean,
            perclos,
            blink_rate,
            yawn_count,
            head_forward_angle,
            shoulder_tilt,
            posture_score,
            face_present_ratio,
            sitting_continuous_min,
            idle_sec,
            input_events,
            tab_category,
            meeting_mode,
            is_synthetic
        ) VALUES (
            u_id,
            'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '2026-11-02 10:00:00+07',
            0.30,
            0.05,
            18.0,
            0,
            12.0,
            2.0,
            90,
            0.98,
            30,
            4,
            75,
            'work',
            false,
            true
        );
    END LOOP;
END $$;

-- Seed Micro Self-Reports (Ground-truth labels)
INSERT INTO self_reports (user_id, ts, kss_score, workload_score, burnout_item, is_synthetic)
VALUES
    ('10000000-0000-0000-0000-000000000002', '2026-11-02 11:30:00+07', 3, 3, 2, true),
    ('10000000-0000-0000-0000-000000000002', '2026-11-02 16:30:00+07', 7, 4, 3, true),
    ('10000000-0000-0000-0000-000000000003', '2026-11-02 11:30:00+07', 2, 2, 1, true),
    ('10000000-0000-0000-0000-000000000003', '2026-11-02 16:30:00+07', 6, 4, 3, true);

-- Seed Tasks with Cycle Times
INSERT INTO tasks (user_id, title, estimated_min, started_at, completed_at, cycle_time_sec)
VALUES
    ('10000000-0000-0000-0000-000000000002', 'Implementasi Unit Tests Shared Math', 45, '2026-11-02 09:30:00+07', '2026-11-02 10:15:00+07', 2700),
    ('10000000-0000-0000-0000-000000000002', 'Review Kebijakan Privasi RLS', 30, '2026-11-02 14:00:00+07', '2026-11-02 14:40:00+07', 2400),
    ('10000000-0000-0000-0000-000000000003', 'Refactoring API Database View', 60, '2026-11-02 10:00:00+07', '2026-11-02 11:10:00+07', 4200);

-- Seed Risk Scores with SHAP Factor Attribution
INSERT INTO risk_scores (user_id, team_id, date, hour, fatigue_risk_level, focus_indicator_level, top_factors)
VALUES
    (
        '10000000-0000-0000-0000-000000000002',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '2026-11-02',
        15,
        'moderate',
        'fluctuating',
        '[
            {"factor": "Durasi duduk kontinu > 80 menit", "impact": 0.38},
            {"factor": "Peningkatan PERCLOS pasca-makan siang", "impact": 0.32},
            {"factor": "Deviasi sudut leher condong", "impact": 0.18}
        ]'::jsonb
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '2026-11-02',
        10,
        'low',
        'steady',
        '[
            {"factor": "Postur tegak stabil", "impact": 0.45},
            {"factor": "Kedipan mata teratur", "impact": 0.35}
        ]'::jsonb
    );
