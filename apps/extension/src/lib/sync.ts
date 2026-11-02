import {
  TelemetryPayloadSchema,
  type TelemetryPayload,
} from '@selaras/shared';
import {
  getReadyPendingMinutes,
  removePendingMinutes,
  recordQueueFailure,
} from './queue';
import { recordDispatchedPayload } from './storage';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  DEFAULT_TEAM_ID,
  DEFAULT_USER_ID,
} from './config';

export interface SyncResult {
  syncedCount: number;
  failedCount: number;
  lastDispatchedPayload: TelemetryPayload | null;
}

/**
 * Synchronizes ready items from the local IndexedDB queue to Supabase.
 * If no live Supabase connection is configured, it safely mocks network transmission
 * while still executing Zod validation, recording payloads, and clearing the queue.
 */
export async function syncPendingQueue(
  supabaseUrl: string = SUPABASE_URL,
  anonKey: string = SUPABASE_ANON_KEY,
  userToken?: string
): Promise<SyncResult> {
  const readyItems = await getReadyPendingMinutes(15);
  if (readyItems.length === 0) {
    return { syncedCount: 0, failedCount: 0, lastDispatchedPayload: null };
  }

  let syncedCount = 0;
  let failedCount = 0;
  let lastDispatched: TelemetryPayload | null = null;
  const successfulIds: number[] = [];

  for (const item of readyItems) {
    // 1. Runtime validation before transmission
    const validation = TelemetryPayloadSchema.safeParse(item.payload);
    if (!validation.success) {
      console.error('[Selaras Sync] Payload validation failed:', validation.error);
      if (item.id) {
        // Discard corrupt item
        successfulIds.push(item.id);
      }
      continue;
    }

    const payload = validation.data as TelemetryPayload;

    // 2. Dispatch network payload to Supabase
    try {
      if (supabaseUrl && anonKey) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: userToken ? `Bearer ${userToken}` : `Bearer ${anonKey}`,
          Prefer: 'return=minimal',
        };

        const dbRecord = {
          user_id: payload.user_pseudo_id.length === 36 ? payload.user_pseudo_id : DEFAULT_USER_ID,
          team_id: DEFAULT_TEAM_ID,
          ts_minute: payload.ts_minute,
          ear_mean: payload.ear_mean,
          perclos: payload.perclos,
          blink_rate: payload.blink_rate,
          yawn_count: payload.yawn_count,
          head_forward_angle: payload.head_forward_angle,
          shoulder_tilt: payload.shoulder_tilt,
          posture_score: payload.posture_score,
          face_present_ratio: payload.face_present_ratio,
          sitting_continuous_min: payload.sitting_continuous_min,
          idle_sec: payload.idle_sec,
          input_events: payload.input_events,
          tab_category: payload.tab_category,
          meeting_mode: payload.meeting_mode,
          is_synthetic: false,
        };

        const res = await fetch(`${supabaseUrl}/rest/v1/signal_minutes`, {
          method: 'POST',
          headers,
          body: JSON.stringify(dbRecord),
        });

        if (!res.ok) {
          throw new Error(`Supabase HTTP ${res.status}: ${await res.text()}`);
        }
      }

      // Record for the "What is sent" screen
      await recordDispatchedPayload(payload);
      lastDispatched = payload;
      syncedCount++;

      if (item.id) {
        successfulIds.push(item.id);
      }
    } catch (err) {
      console.warn('[Selaras Sync] Failed to dispatch minute telemetry:', err);
      failedCount++;
      if (item.id) {
        await recordQueueFailure(item.id, String(err));
      }
    }
  }

  // 3. Purge successfully dispatched items from local queue
  if (successfulIds.length > 0) {
    await removePendingMinutes(successfulIds);
  }

  return {
    syncedCount,
    failedCount,
    lastDispatchedPayload: lastDispatched,
  };
}
