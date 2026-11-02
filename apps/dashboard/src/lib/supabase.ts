export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kaiodikurgqcmismvaad.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_3edw4iG603bkdDdkcj2BVQ_6FvYba2n';

export interface TeamSessionRecord {
  id: string;
  team_id: string;
  created_by?: string;
  title: string;
  status: 'active' | 'completed';
  started_at: string;
  ended_at?: string;
}

export interface SignalMinuteRecord {
  id: string;
  user_id: string;
  team_id: string;
  ts_minute: string;
  ear_mean: number;
  perclos: number;
  blink_rate: number;
  yawn_count: number;
  head_forward_angle: number;
  shoulder_tilt: number;
  posture_score: number;
  face_present_ratio: number;
  sitting_continuous_min: number;
  idle_sec: number;
  input_events: number;
  tab_category?: string;
  meeting_mode: boolean;
  is_synthetic: boolean;
  created_at: string;
}

export async function getActiveTeamSession(teamId: string): Promise<TeamSessionRecord | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/team_sessions?team_id=eq.${teamId}&status=eq.active&select=*&order=started_at.desc&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        cache: 'no-store',
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

export async function startTeamSession(teamId: string, title = 'Sesi Kerja Tim'): Promise<TeamSessionRecord | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/team_sessions`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        team_id: teamId,
        title,
        status: 'active',
        started_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

export async function stopTeamSession(sessionId: string): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/team_sessions?id=eq.${sessionId}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        status: 'completed',
        ended_at: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getRecentSignalMinutes(teamId: string, limit = 10): Promise<SignalMinuteRecord[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/signal_minutes?team_id=eq.${teamId}&select=*&order=ts_minute.desc&limit=${limit}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        cache: 'no-store',
      }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
