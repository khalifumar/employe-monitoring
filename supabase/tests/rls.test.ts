import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Supabase Schema & RLS Isolation Tests (PGlite)", () => {
  let db: PGlite;

  const USER_BUDI_MANAGER = "10000000-0000-0000-0000-000000000001";
  const USER_CITRA_OPTOUT = "10000000-0000-0000-0000-000000000002";
  const USER_AHMAD_OPTIN = "10000000-0000-0000-0000-000000000003";
  const USER_SITI_ORG2 = "30000000-0000-0000-0000-000000000001";

  const TEAM_1_K6 = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const TEAM_2_K3 = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

  async function setContextUser(userId: string | null) {
    if (userId) {
      await db.exec(`
        SET ROLE authenticated;
        SELECT set_config('request.jwt.claim.sub', '${userId}', false);
      `);
    } else {
      await db.exec(`
        RESET ROLE;
        SELECT set_config('request.jwt.claim.sub', '', false);
      `);
    }
  }

  beforeAll(async () => {
    db = new PGlite();

    // 1. Setup mock auth schema & auth.uid() function
    await db.exec(`
      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
        SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
      $$ LANGUAGE sql STABLE;
    `);

    // 2. Read and apply migration files
    const migrationsDir = path.resolve(__dirname, "../migrations");
    const migration1 = fs.readFileSync(
      path.join(migrationsDir, "20261102000001_initial_schema.sql"),
      "utf-8",
    );
    const migration2 = fs.readFileSync(
      path.join(migrationsDir, "20261102000002_rls_policies.sql"),
      "utf-8",
    );
    const migration3 = fs.readFileSync(
      path.join(migrationsDir, "20261102000003_k_anonymity_view.sql"),
      "utf-8",
    );

    await db.exec(migration1);
    await db.exec(migration2);
    await db.exec(migration3);

    // 3. Load synthetic seed data
    const seedSql = fs.readFileSync(
      path.resolve(__dirname, "../seed.sql"),
      "utf-8",
    );
    await db.exec(seedSql);

    // 4. Create standard Supabase 'authenticated' role without superuser or bypassrls privileges
    await db.exec(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated NOLOGIN NOINHERIT;
        END IF;
      END $$;
      GRANT USAGE ON SCHEMA public TO authenticated;
      GRANT USAGE ON SCHEMA auth TO authenticated;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
      GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
    `);
  });

  afterAll(async () => {
    await db.close();
  });

  it("enforces cross-organization isolation (Citra in Org 1 cannot see Org 2 profiles)", async () => {
    await setContextUser(USER_CITRA_OPTOUT);

    const res = await db.query(`SELECT * FROM profiles WHERE id = $1`, [
      USER_SITI_ORG2,
    ]);

    // Should return 0 rows because Siti is in Org 2
    expect(res.rows.length).toBe(0);
  });

  it("allows user to view profiles within the same organization", async () => {
    await setContextUser(USER_CITRA_OPTOUT);

    const res = await db.query(`SELECT * FROM profiles WHERE id = $1`, [
      USER_AHMAD_OPTIN,
    ]);

    // Both Citra and Ahmad are in Org 1
    expect(res.rows.length).toBe(1);
  });

  it("enforces cross-user isolation: employee cannot read another employee individual raw minutes", async () => {
    await setContextUser(USER_CITRA_OPTOUT);

    const res = await db.query(
      `SELECT * FROM signal_minutes WHERE user_id = $1`,
      [USER_AHMAD_OPTIN],
    );

    // Citra cannot see Ahmad's raw minutes
    expect(res.rows.length).toBe(0);
  });

  it("allows employee to view their own raw signal minutes", async () => {
    await setContextUser(USER_CITRA_OPTOUT);

    const res = await db.query(
      `SELECT * FROM signal_minutes WHERE user_id = $1`,
      [USER_CITRA_OPTOUT],
    );

    expect(res.rows.length).toBeGreaterThan(0);
  });

  it("prevents manager from reading member raw data when employee opted out", async () => {
    await setContextUser(USER_BUDI_MANAGER);

    const res = await db.query(
      `SELECT * FROM signal_minutes WHERE user_id = $1`,
      [USER_CITRA_OPTOUT],
    );

    // Citra has manager_individual_view = false -> Manager receives 0 rows
    expect(res.rows.length).toBe(0);
  });

  it("allows manager to read member raw data ONLY WHEN employee opted in", async () => {
    await setContextUser(USER_BUDI_MANAGER);

    const res = await db.query(
      `SELECT * FROM signal_minutes WHERE user_id = $1`,
      [USER_AHMAD_OPTIN],
    );

    // Ahmad has manager_individual_view = true -> Manager can view
    expect(res.rows.length).toBeGreaterThan(0);
  });

  it("returns aggregated team metrics when active team size >= 5 (k-anonymity satisfied)", async () => {
    // Team 1 has 6 active members
    const res = await db.query(
      `SELECT * FROM team_wellbeing_hourly_view WHERE team_id = $1`,
      [TEAM_1_K6],
    );

    expect(res.rows.length).toBeGreaterThan(0);
    const row = res.rows[0] as {
      active_members_count: number;
      k_anonymity_satisfied: boolean;
    };
    expect(Number(row.active_members_count)).toBeGreaterThanOrEqual(5);
    expect(row.k_anonymity_satisfied).toBe(true);
  });

  it("suppresses team aggregate view (returns 0 rows) when active team size < 5 (k-anonymity enforced)", async () => {
    // Team 2 has only 3 active members (< 5)
    const res = await db.query(
      `SELECT * FROM team_wellbeing_hourly_view WHERE team_id = $1`,
      [TEAM_2_K3],
    );

    // MUST return 0 rows to protect individual anonymity in small teams
    expect(res.rows.length).toBe(0);
  });

  it("allows employee to delete own data without affecting others (Right to be Forgotten)", async () => {
    await setContextUser(USER_CITRA_OPTOUT);

    // Delete Citra's records
    await db.query(`DELETE FROM signal_minutes WHERE user_id = $1`, [
      USER_CITRA_OPTOUT,
    ]);

    const citraRes = await db.query(
      `SELECT * FROM signal_minutes WHERE user_id = $1`,
      [USER_CITRA_OPTOUT],
    );
    expect(citraRes.rows.length).toBe(0);

    // Verify Ahmad's records still exist
    await setContextUser(USER_AHMAD_OPTIN);
    const ahmadRes = await db.query(
      `SELECT * FROM signal_minutes WHERE user_id = $1`,
      [USER_AHMAD_OPTIN],
    );
    expect(ahmadRes.rows.length).toBeGreaterThan(0);
  });
});
