import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TelemetryPayload } from '@selaras/shared';
import * as queue from '../src/lib/queue';
import * as storage from '../src/lib/storage';
import { syncPendingQueue } from '../src/lib/sync';

describe('What is Sent Screen Integrity Test', () => {
  let storedLastPayload: TelemetryPayload | null = null;
  let interceptedNetworkBody: string | null = null;

  beforeEach(() => {
    vi.restoreAllMocks();
    storedLastPayload = null;
    interceptedNetworkBody = null;

    // Spy on recordDispatchedPayload to track what is stored for the "What is sent" UI
    vi.spyOn(storage, 'recordDispatchedPayload').mockImplementation(async (payload) => {
      storedLastPayload = payload;
    });

    vi.spyOn(storage, 'getLastSyncedPayload').mockImplementation(async () => {
      return storedLastPayload;
    });

    // Mock fetch to intercept the actual network payload sent to Supabase
    global.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      if (init && init.body) {
        interceptedNetworkBody = init.body as string;
      }
      return {
        ok: true,
        status: 201,
        text: async () => '',
      } as Response;
    });
  });

  it('guarantees that the "What is sent" screen JSON strictly equals the actual network payload', async () => {
    const minutePayload: TelemetryPayload = {
      user_pseudo_id: 'usr_550e8400-e29b-41d4-a716-446655440000',
      ts_minute: '2026-11-02T10:15:00.000Z',
      ear_mean: 0.3125,
      perclos: 0.0512,
      blink_rate: 16.5,
      yawn_count: 0,
      head_forward_angle: 14.25,
      shoulder_tilt: 2.15,
      posture_score: 91,
      face_present_ratio: 0.985,
      sitting_continuous_min: 42,
      idle_sec: 4,
      input_events: 78,
      tab_category: null,
      meeting_mode: false,
    };

    // Mock IndexedDB returning this pending item
    vi.spyOn(queue, 'getReadyPendingMinutes').mockResolvedValue([
      {
        id: 101,
        payload: minutePayload,
        attempts: 0,
        nextRetryMs: Date.now(),
        createdAtMs: Date.now(),
      },
    ]);
    vi.spyOn(queue, 'removePendingMinutes').mockResolvedValue();

    // Trigger sync to Supabase
    const result = await syncPendingQueue('https://mock-proj.supabase.co', 'mock-anon-key');

    expect(result.syncedCount).toBe(1);
    expect(interceptedNetworkBody).not.toBeNull();

    // Parse the actual raw string transmitted over the wire
    const actualNetworkPayload = JSON.parse(interceptedNetworkBody!);

    // Retrieve what the employee sees on the "What is sent" screen
    const displayedPayload = await storage.getLastSyncedPayload();

    // CRITICAL ASSERTION: The "What is sent" screen JSON matches the actual network payload byte-for-byte
    expect(displayedPayload).toEqual(actualNetworkPayload);
    expect(displayedPayload).toEqual(minutePayload);

    // Verify privacy constraints on transmitted network payload
    expect(actualNetworkPayload).not.toHaveProperty('image');
    expect(actualNetworkPayload).not.toHaveProperty('landmarks');
    expect(actualNetworkPayload).not.toHaveProperty('webcam');
    expect(actualNetworkPayload).not.toHaveProperty('keys_typed');
    expect(actualNetworkPayload).not.toHaveProperty('url');
  });
});
