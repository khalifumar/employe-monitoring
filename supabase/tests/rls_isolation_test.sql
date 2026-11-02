-- ==============================================================================
-- PROJECT "SELARAS" — RLS & K-ANONYMITY ISOLATION TEST SCRIPT
-- ==============================================================================
-- This test suite proves:
-- 1. Cross-org isolation: User A (Org 1) cannot read profiles/teams from Org 2.
-- 2. Cross-user isolation: Employee Citra (User 2) cannot select Ahmad's (User 3) minute records.
-- 3. Manager raw telemetri boundary:
--    - Manager Budi cannot read Citra's minute records (opted out).
--    - Manager Budi CAN read Ahmad's minute records (opted in).
-- 4. K-Anonymity view:
--    - Team 1 (6 members): rows are visible (k >= 5 satisfied).
--    - Team 2 (3 members): 0 rows returned (suppressed by HAVING clause).
-- 5. Right to be forgotten:
--    - Employee can delete own records without affecting others.
-- ==============================================================================

BEGIN;

-- Setup test helper: function to set mock current user
CREATE OR REPLACE FUNCTION set_mock_user(p_user_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('request.jwt.claim.sub', p_user_id::text, true);
END;
$$ LANGUAGE plpgsql;

-- Test 1: Cross-Org Isolation
-- Citra (Org 1) tries to select Org 2 profiles
SELECT set_mock_user('10000000-0000-0000-0000-000000000002');
-- Should return 0 rows for Org 2 member Siti Nurhaliza
SELECT COUNT(*) = 0 AS passed_cross_org_isolation
FROM profiles
WHERE id = '30000000-0000-0000-0000-000000000001';

-- Test 2: Cross-User Isolation on Signal Minutes
-- Citra (User 2) tries to select Ahmad's (User 3) minutes
SELECT COUNT(*) = 0 AS passed_cross_user_isolation
FROM signal_minutes
WHERE user_id = '10000000-0000-0000-0000-000000000003';

-- Test 3: Manager Access Boundary (Opt-in vs Opt-out)
-- Switch to Manager Budi (User 1)
SELECT set_mock_user('10000000-0000-0000-0000-000000000001');

-- Citra opted OUT -> Manager should see 0 rows
SELECT COUNT(*) = 0 AS passed_manager_optout_boundary
FROM signal_minutes
WHERE user_id = '10000000-0000-0000-0000-000000000002';

-- Ahmad opted IN -> Manager SHOULD see Ahmad's rows
SELECT COUNT(*) > 0 AS passed_manager_optin_access
FROM signal_minutes
WHERE user_id = '10000000-0000-0000-0000-000000000003';

-- Test 4: K-Anonymity Team Aggregate Enforcement
-- Team 1 has 6 active members -> team_wellbeing_hourly_view returns aggregated rows
SELECT COUNT(*) > 0 AS passed_k_anonymity_satisfied
FROM team_wellbeing_hourly_view
WHERE team_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Team 2 has 3 active members (< 5) -> team_wellbeing_hourly_view returns 0 rows!
SELECT COUNT(*) = 0 AS passed_k_anonymity_suppressed
FROM team_wellbeing_hourly_view
WHERE team_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Test 5: Employee Data Deletion (Right to be Forgotten)
-- Citra deletes her own records
SELECT set_mock_user('10000000-0000-0000-0000-000000000002');
DELETE FROM signal_minutes WHERE user_id = '10000000-0000-0000-0000-000000000002';

-- Verify Citra's records are gone, but Ahmad's records remain untouched
SELECT COUNT(*) = 0 AS passed_self_deleted
FROM signal_minutes
WHERE user_id = '10000000-0000-0000-0000-000000000002';

SELECT COUNT(*) > 0 AS passed_other_user_preserved
FROM signal_minutes
WHERE user_id = '10000000-0000-0000-0000-000000000003';

ROLLBACK;
