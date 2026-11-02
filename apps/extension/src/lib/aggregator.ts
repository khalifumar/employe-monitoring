import type { TelemetryPayload } from '@selaras/shared';
import {
  getOrCreateUserPseudoId,
  getConsentSettings,
  isMonitoringPaused,
  isMeetingMode,
} from './storage';
import { enqueuePendingMinute } from './queue';
import { syncPendingQueue } from './sync';

export interface MinuteSignalAccumulator {
  inputEvents: number;
  idleSeconds: number;
  sittingMinutes: number;
  earSamples: number[];
  headAngleSamples: number[];
  shoulderTiltSamples: number[];
  postureScores: number[];
  yawnCount: number;
  blinkCount: number;
  faceDetectedFrames: number;
  totalFrames: number;
  tabCategory: 'work' | 'communication' | 'leisure' | 'other' | null;
}

export function createEmptyAccumulator(): MinuteSignalAccumulator {
  return {
    inputEvents: 0,
    idleSeconds: 0,
    sittingMinutes: 0,
    earSamples: [],
    headAngleSamples: [],
    shoulderTiltSamples: [],
    postureScores: [],
    yawnCount: 0,
    blinkCount: 0,
    faceDetectedFrames: 0,
    totalFrames: 0,
    tabCategory: null,
  };
}

let currentAccumulator: MinuteSignalAccumulator = createEmptyAccumulator();
let continuousSittingMinutes = 0;

export function addInputEvents(count: number): void {
  currentAccumulator.inputEvents += count;
}

export function setMinuteIdleSeconds(sec: number): void {
  currentAccumulator.idleSeconds = Math.max(0, Math.min(60, sec));
}

export function addVisionSample(sample: {
  ear?: number;
  headAngle?: number;
  shoulderTilt?: number;
  postureScore?: number;
  isFacePresent: boolean;
  isBlink?: boolean;
  isYawn?: boolean;
}): void {
  currentAccumulator.totalFrames++;
  if (sample.isFacePresent) {
    currentAccumulator.faceDetectedFrames++;
    if (sample.ear !== undefined) currentAccumulator.earSamples.push(sample.ear);
    if (sample.headAngle !== undefined) currentAccumulator.headAngleSamples.push(sample.headAngle);
    if (sample.shoulderTilt !== undefined) currentAccumulator.shoulderTiltSamples.push(sample.shoulderTilt);
    if (sample.postureScore !== undefined) currentAccumulator.postureScores.push(sample.postureScore);
  }
  if (sample.isBlink) currentAccumulator.blinkCount++;
  if (sample.isYawn) currentAccumulator.yawnCount++;
}

/**
 * Builds the exact 1-minute TelemetryPayload and enqueues it to IndexedDB.
 */
export async function finalizeAndFlushMinute(): Promise<TelemetryPayload | null> {
  const isPaused = await isMonitoringPaused();
  if (isPaused) {
    // Monitoring paused by employee: no telemetry generated
    currentAccumulator = createEmptyAccumulator();
    return null;
  }

  const consents = await getConsentSettings();
  const meetingActive = await isMeetingMode();
  const userPseudoId = await getOrCreateUserPseudoId();

  // If user was completely absent (> 55s idle), reset sitting counter; otherwise increment
  if (currentAccumulator.idleSeconds > 55) {
    continuousSittingMinutes = 0;
  } else {
    continuousSittingMinutes += 1;
  }

  // Calculate averages safely
  const avg = (arr: number[], fallback: number) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : fallback;

  // Drowsiness metrics (only if consent granted)
  let earMean = 0.30;
  let perclos = 0.05;
  let blinkRate = 16.0;
  let yawnCount = 0;

  if (consents.drowsiness_detection && currentAccumulator.earSamples.length > 0) {
    earMean = avg(currentAccumulator.earSamples, 0.30);
    const closedFrames = currentAccumulator.earSamples.filter((e) => e < 0.21).length;
    perclos = closedFrames / currentAccumulator.earSamples.length;
    blinkRate = currentAccumulator.blinkCount;
    yawnCount = currentAccumulator.yawnCount;
  }

  // Posture metrics (only if consent granted)
  let headForwardAngle = 12.0;
  let shoulderTilt = 2.0;
  let postureScore = 88;

  if (consents.posture_detection && currentAccumulator.headAngleSamples.length > 0) {
    headForwardAngle = avg(currentAccumulator.headAngleSamples, 12.0);
    shoulderTilt = avg(currentAccumulator.shoulderTiltSamples, 2.0);
    postureScore = Math.round(avg(currentAccumulator.postureScores, 88));
  }

  const faceRatio = currentAccumulator.totalFrames > 0
    ? currentAccumulator.faceDetectedFrames / currentAccumulator.totalFrames
    : 1.0;

  // Truncate timestamp to current minute (e.g. 2026-11-02T10:15:00.000Z)
  const now = new Date();
  now.setSeconds(0, 0);
  const tsMinute = now.toISOString();

  // Only include input events if activity tracking is consented
  const inputEvents = consents.activity_tracking ? currentAccumulator.inputEvents : 0;

  // Coarse tab category only if explicitly opted in
  const tabCategory = consents.tab_category_opt_in ? currentAccumulator.tabCategory : null;

  const payload: TelemetryPayload = {
    user_pseudo_id: userPseudoId,
    ts_minute: tsMinute,
    ear_mean: Number(earMean.toFixed(4)),
    perclos: Number(perclos.toFixed(4)),
    blink_rate: Number(blinkRate.toFixed(1)),
    yawn_count: yawnCount,
    head_forward_angle: Number(headForwardAngle.toFixed(2)),
    shoulder_tilt: Number(shoulderTilt.toFixed(2)),
    posture_score: Math.min(100, Math.max(0, postureScore)),
    face_present_ratio: Number(faceRatio.toFixed(3)),
    sitting_continuous_min: continuousSittingMinutes,
    idle_sec: currentAccumulator.idleSeconds,
    input_events: inputEvents,
    tab_category: tabCategory,
    meeting_mode: meetingActive,
  };

  // Reset accumulator for next minute
  currentAccumulator = createEmptyAccumulator();

  // Enqueue to IndexedDB
  await enqueuePendingMinute(payload);

  // Trigger sync in background
  syncPendingQueue().catch((err) =>
    console.warn('[Selaras Aggregator] Background sync error:', err)
  );

  return payload;
}
