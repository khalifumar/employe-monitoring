-- ==============================================================================
-- PROJECT "SELARAS" — ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. Enable RLS on all tables and force it for all roles (including owner)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams FORCE ROW LEVEL SECURITY;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships FORCE ROW LEVEL SECURITY;

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents FORCE ROW LEVEL SECURITY;

ALTER TABLE signal_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_minutes FORCE ROW LEVEL SECURITY;

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;

ALTER TABLE self_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores FORCE ROW LEVEL SECURITY;

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;

-- Helper function: Get current user's organization id
CREATE OR REPLACE FUNCTION get_auth_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: Check if current user is manager or admin
CREATE OR REPLACE FUNCTION is_manager_or_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('manager', 'admin') FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: Check if an employee has explicitly granted manager individual view consent
CREATE OR REPLACE FUNCTION has_manager_view_consent(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM consents
    WHERE user_id = p_user_id
      AND signal_type = 'manager_individual_view'
      AND granted = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Users can view profiles within their own organization
CREATE POLICY "Users can view members of their own organization"
ON profiles FOR SELECT
USING (org_id = get_auth_org_id());

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------------------------
-- ORGANIZATIONS POLICIES
-- ------------------------------------------------------------------------------
-- Users can view their own organization
CREATE POLICY "Users can view own organization"
ON organizations FOR SELECT
USING (id = get_auth_org_id());

-- ------------------------------------------------------------------------------
-- TEAMS POLICIES
-- ------------------------------------------------------------------------------
-- Users can view teams in their organization
CREATE POLICY "Users can view teams in own organization"
ON teams FOR SELECT
USING (org_id = get_auth_org_id());

-- ------------------------------------------------------------------------------
-- TEAM MEMBERSHIPS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view team memberships in own organization"
ON team_memberships FOR SELECT
USING (
  team_id IN (SELECT id FROM teams WHERE org_id = get_auth_org_id())
);

-- ------------------------------------------------------------------------------
-- CONSENTS POLICIES (Full autonomy for employee)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own consents"
ON consents FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own consents"
ON consents FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own consents"
ON consents FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- SIGNAL MINUTES POLICIES (Privacy Invariant: Strict User Isolation)
-- ------------------------------------------------------------------------------
-- 1. Employee can select own minute records
CREATE POLICY "Employees can select own signal minutes"
ON signal_minutes FOR SELECT
USING (user_id = auth.uid());

-- 2. Employee can insert own minute records
CREATE POLICY "Employees can insert own signal minutes"
ON signal_minutes FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 3. Employee can delete own minute records (Right to be Forgotten)
CREATE POLICY "Employees can delete own signal minutes"
ON signal_minutes FOR DELETE
USING (user_id = auth.uid());

-- 4. Manager can select raw minute data ONLY IF employee explicitly opted in
CREATE POLICY "Managers can select individual data only if employee opted in"
ON signal_minutes FOR SELECT
USING (
  is_manager_or_admin()
  AND team_id IN (
    SELECT team_id FROM team_memberships WHERE user_id = auth.uid()
  )
  AND has_manager_view_consent(signal_minutes.user_id)
);

-- ------------------------------------------------------------------------------
-- TASKS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can manage own tasks"
ON tasks FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- SELF REPORTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can select own self reports"
ON self_reports FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own self reports"
ON self_reports FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- RISK SCORES POLICIES
-- ------------------------------------------------------------------------------
-- Employee can read own risk scores
CREATE POLICY "Users can read own risk scores"
ON risk_scores FOR SELECT
USING (user_id = auth.uid());

-- Manager can read individual risk scores only if employee opted in
CREATE POLICY "Managers can read individual risk score only if opted in"
ON risk_scores FOR SELECT
USING (
  is_manager_or_admin()
  AND team_id IN (
    SELECT team_id FROM team_memberships WHERE user_id = auth.uid()
  )
  AND has_manager_view_consent(risk_scores.user_id)
);

-- ------------------------------------------------------------------------------
-- AUDIT LOG POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own audit log"
ON audit_log FOR SELECT
USING (user_id = auth.uid());
