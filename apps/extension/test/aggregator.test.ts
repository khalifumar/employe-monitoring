import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createEmptyAccumulator,
  addInputEvents,
  setMinuteIdleSeconds,
  addVisionSample,
  finalizeAndFlushMinute,
} from '../src/lib/aggregator';
import * as storage from '../src/lib/storage';
import * as queue from '../src/lib/queue';

describe('Minute Telemetry Aggregator', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an empty accumulator with zeroed counts and empty arrays', () => {
    const acc = createEmptyAccumulator();
    expect(acc.inputEvents).toBe(0);
    expect(acc.idleSeconds).toBe(0);
    expect(acc.earSamples).toEqual([]);
    expect(acc.headAngleSamples).toEqual([]);
  });

  it('aggregates input event counts without recording any text content', async () => {
    // Mock storage functions
    vi.spyOn(storage, 'isMonitoringPaused').mockResolvedValue(false);
    vi.spyOn(storage, 'isMeetingMode').mockResolvedValue(false);
    vi.spyOn(storage, 'getOrCreateUserPseudoId').mockResolvedValue('test-user-uuid');
    vi.spyOn(storage, 'getConsentSettings').mockResolvedValue({
      drowsiness_detection: true,
      posture_detection: true,
      activity_tracking: true,
      task_timer: true,
      tab_category_opt_in: false,
      manager_individual_view_opt_in: false,
      last_updated: '2026-11-02T10:00:00Z',
    });

    const enqueueSpy = vi.spyOn(queue, 'enqueuePendingMinute').mockResolvedValue(1);

    // Simulate input events received from content script
    addInputEvents(15);
    addInputEvents(25);
    setMinuteIdleSeconds(4);

    // Simulate vision frames
    addVisionSample({ ear: 0.32, headAngle: 12.0, shoulderTilt: 2.0, postureScore: 92, isFacePresent: true });
    addVisionSample({ ear: 0.18, isBlink: true, isFacePresent: true }); // closed eye (blink)

    const payload = await finalizeAndFlushMinute();

    expect(payload).not.toBeNull();
    if (payload) {
      expect(payload.input_events).toBe(40); // 15 + 25 = 40
      expect(payload.idle_sec).toBe(4);
      expect(payload.tab_category).toBeNull(); // Opt-in was false
      expect(payload.meeting_mode).toBe(false);
      expect(payload.user_pseudo_id).toBe('test-user-uuid');
      expect(payload.blink_rate).toBe(1);
    }
    expect(enqueueSpy).toHaveBeenCalledTimes(1);
  });

  it('produces NO telemetry when monitoring is paused by user', async () => {
    vi.spyOn(storage, 'isMonitoringPaused').mockResolvedValue(true);
    const enqueueSpy = vi.spyOn(queue, 'enqueuePendingMinute').mockResolvedValue(1);

    addInputEvents(50);
    const payload = await finalizeAndFlushMinute();

    expect(payload).toBeNull();
    expect(enqueueSpy).not.toHaveBeenCalled();
  });

  it('zeroes input events if activity tracking consent is revoked', async () => {
    vi.spyOn(storage, 'isMonitoringPaused').mockResolvedValue(false);
    vi.spyOn(storage, 'isMeetingMode').mockResolvedValue(false);
    vi.spyOn(storage, 'getOrCreateUserPseudoId').mockResolvedValue('test-user-uuid');
    vi.spyOn(storage, 'getConsentSettings').mockResolvedValue({
      drowsiness_detection: true,
      posture_detection: true,
      activity_tracking: false, // CONSENT REVOKED
      task_timer: true,
      tab_category_opt_in: false,
      manager_individual_view_opt_in: false,
      last_updated: '2026-11-02T10:00:00Z',
    });
    vi.spyOn(queue, 'enqueuePendingMinute').mockResolvedValue(1);

    addInputEvents(100);
    const payload = await finalizeAndFlushMinute();

    expect(payload).not.toBeNull();
    if (payload) {
      expect(payload.input_events).toBe(0); // Strictly zeroed
    }
  });
});
