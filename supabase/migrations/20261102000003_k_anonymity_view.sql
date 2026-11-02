-- ==============================================================================
-- PROJECT "SELARAS" — K-ANONYMITY AGGREGATE VIEWS & RETENTION AUTOMATION
-- ==============================================================================

-- 1. Hourly Team Wellbeing Aggregate View (Enforcing k >= 5)
-- Returns 0 rows if active members contributing in that hour is less than 5.
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
HAVING COUNT(DISTINCT user_id) >= 5; -- K-ANONYMITY INVARIANT: Min 5 distinct users

-- 2. Daily Team Wellbeing Aggregate View (Enforcing k >= 5)
CREATE OR REPLACE VIEW team_wellbeing_daily_view AS
SELECT 
    team_id,
    date_trunc('day', ts_minute) AS day_bucket,
    COUNT(DISTINCT user_id) AS active_members_count,
    ROUND(AVG(perclos)::numeric, 4) AS avg_perclos,
    ROUND(AVG(posture_score)::numeric, 1) AS avg_posture_score,
    ROUND(AVG(sitting_continuous_min)::numeric, 1) AS avg_sitting_min,
    SUM(input_events) AS total_input_events,
    SUM(yawn_count) AS total_yawns,
    true AS k_anonymity_satisfied
FROM signal_minutes
GROUP BY team_id, date_trunc('day', ts_minute)
HAVING COUNT(DISTINCT user_id) >= 5;

-- 3. Function to check if a team currently meets k-anonymity requirement
CREATE OR REPLACE FUNCTION check_team_k_anonymity(p_team_id UUID)
RETURNS TABLE (
    team_id UUID,
    member_count BIGINT,
    meets_k_anonymity BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_team_id,
        COUNT(DISTINCT tm.user_id) AS member_count,
        (COUNT(DISTINCT tm.user_id) >= 5) AS meets_k_anonymity
    FROM team_memberships tm
    WHERE tm.team_id = p_team_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4. 90-Day Retention Cleanup Procedure
CREATE OR REPLACE FUNCTION purge_expired_raw_telemetry()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM signal_minutes
    WHERE ts_minute < (NOW() - INTERVAL '90 days')
      AND is_synthetic = false; -- Preserve explicit synthetic seeds if tagged
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable pg_cron if available (Supabase Postgres Extensions)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        PERFORM cron.schedule(
            'selaras-nightly-purge-90d',
            '0 3 * * *', -- Everyday at 03:00 AM UTC
            'SELECT purge_expired_raw_telemetry();'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Silently pass if pg_cron is not enabled in local test environment
        NULL;
END;
$$;
