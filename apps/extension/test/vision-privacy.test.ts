import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractVisionFeatures,
  type RawLandmarkPoint,
} from '../src/lib/vision/feature-extractor';
import {
  addVisionSample,
  finalizeAndFlushMinute,
} from '../src/lib/aggregator';
import { syncPendingQueue } from '../src/lib/sync';
import * as storage from '../src/lib/storage';
import * as queue from '../src/lib/queue';

describe('Vision Privacy Invariant Tests (Zero-Frames & Zero-Landmarks on Wire)', () => {
  let interceptedNetworkBody: string | null = null;
  let interceptedHeaders: Record<string, string> = {};

  beforeEach(() => {
    interceptedNetworkBody = null;
    interceptedHeaders = {};

    vi.spyOn(storage, 'isMonitoringPaused').mockResolvedValue(false);
    vi.spyOn(storage, 'isMeetingMode').mockResolvedValue(false);
    vi.spyOn(storage, 'getOrCreateUserPseudoId').mockResolvedValue('usr_privacy_test_777');
    vi.spyOn(storage, 'getConsentSettings').mockResolvedValue({
      drowsiness_detection: true,
      posture_detection: true,
      activity_tracking: true,
      task_timer: true,
      tab_category_opt_in: false,
      manager_individual_view_opt_in: false,
      last_updated: '2026-11-02T00:00:00Z',
    });

    global.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      if (init && init.body) {
        interceptedNetworkBody = init.body as string;
      }
      if (init && init.headers) {
        interceptedHeaders = init.headers as Record<string, string>;
      }
      return {
        ok: true,
        status: 201,
        text: async () => '',
      } as Response;
    });
  });

  it('guarantees that no video frame, image, base64, or landmark coordinates ever appear in network requests', async () => {
    // 1. Generate realistic 478 face landmarks and 33 pose landmarks
    const mockFaceLandmarks: RawLandmarkPoint[] = Array.from({ length: 478 }, (_, i) => ({
      x: 0.45 + (i * 0.001),
      y: 0.35 + (i * 0.001),
      z: -0.02 + (i * 0.0001),
    }));

    const mockPoseLandmarks: RawLandmarkPoint[] = Array.from({ length: 33 }, (_, i) => ({
      x: 0.50 + (i * 0.005),
      y: 0.40 + (i * 0.005),
      z: 0.01,
    }));

    // 2. Extract scalar features
    const metrics = extractVisionFeatures([mockFaceLandmarks], [mockPoseLandmarks]);

    // 3. Accumulate multiple vision frames into aggregator
    for (let f = 0; f < 30; f++) {
      addVisionSample({
        ear: metrics.ear,
        headAngle: metrics.headForwardAngle,
        shoulderTilt: metrics.shoulderTilt,
        postureScore: metrics.postureScore,
        isFacePresent: metrics.facePresent,
        isBlink: metrics.isBlink,
        isYawn: metrics.isYawn,
      });
    }

    // 4. Finalize minute and trigger network sync
    const payload = await finalizeAndFlushMinute();
    expect(payload).not.toBeNull();

    vi.spyOn(queue, 'getReadyPendingMinutes').mockResolvedValue([
      {
        id: 1,
        payload: payload!,
        attempts: 0,
        nextRetryMs: 0,
        createdAtMs: Date.now(),
      },
    ]);

    vi.spyOn(queue, 'removePendingMinutes').mockResolvedValue();

    await syncPendingQueue('https://mock-proj.supabase.co', 'mock-anon-key');

    // 5. Assert network payload was captured
    expect(interceptedNetworkBody).not.toBeNull();

    // 6. Strict Privacy Invariants on the network body
    const bodyText = interceptedNetworkBody!.toLowerCase();

    // Must NOT contain forbidden surveillance terms or binary artifacts
    const forbiddenPatterns = [
      'image',
      'frame',
      'pixels',
      'canvas',
      'base64',
      'data:image',
      'jpeg',
      'png',
      'blob',
      'landmark',
      'landmarks',
      'coordinates',
      'float32array',
      'uint8array',
      'tensor',
    ];

    for (const pattern of forbiddenPatterns) {
      expect(bodyText).not.toContain(pattern);
    }

    // Must strictly be valid JSON and match TelemetryPayload
    const parsed = JSON.parse(interceptedNetworkBody!);
    expect(parsed.user_pseudo_id).toBe('usr_privacy_test_777');
    expect(typeof parsed.ear_mean).toBe('number');
    expect(typeof parsed.perclos).toBe('number');
    expect(typeof parsed.posture_score).toBe('number');
    expect(typeof parsed.head_forward_angle).toBe('number');
    expect(typeof parsed.shoulder_tilt).toBe('number');

    // Assure all properties are primitives (no arrays of coordinates, no nested objects)
    for (const [_key, value] of Object.entries(parsed)) {
      if (value === null) {
        expect(value).toBeNull();
      } else {
        expect(['number', 'string', 'boolean']).toContain(typeof value);
      }
      expect(Array.isArray(value)).toBe(false);
    }
  });
});
