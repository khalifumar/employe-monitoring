import { describe, it, expect } from 'vitest';
import {
  extractVisionFeatures,
  extractEyeLandmarks,
  extractMouthLandmarks,
  extractPostureLandmarks,
  DEFAULT_PERSONAL_BASELINE,
  type RawLandmarkPoint,
} from '../src/lib/vision/feature-extractor';

// Helper to create synthetic face landmark array of 478 points
function createSyntheticFaceLandmarks(options: {
  eyeOpenness?: number; // multiplier for eye height
  mouthOpenness?: number; // multiplier for mouth height
  dx?: number;
}): RawLandmarkPoint[] {
  const points: RawLandmarkPoint[] = Array.from({ length: 478 }, (_, i) => ({
    x: 0.5 + (i % 20) * 0.01,
    y: 0.5 + Math.floor(i / 20) * 0.01,
    z: 0.0,
  }));

  const eyeScale = options.eyeOpenness ?? 1.0;
  const mouthScale = options.mouthOpenness ?? 1.0;

  // Left Eye: 33 (outer), 160 (p2), 158 (p3), 133 (inner), 153 (p5), 144 (p6)
  points[33] = { x: 0.35, y: 0.40 };
  points[133] = { x: 0.45, y: 0.40 };
  points[160] = { x: 0.38, y: 0.40 - 0.03 * eyeScale };
  points[158] = { x: 0.42, y: 0.40 - 0.03 * eyeScale };
  points[144] = { x: 0.38, y: 0.40 + 0.03 * eyeScale };
  points[153] = { x: 0.42, y: 0.40 + 0.03 * eyeScale };

  // Right Eye: 263 (outer), 387 (p2), 385 (p3), 362 (inner), 380 (p5), 373 (p6)
  points[263] = { x: 0.65, y: 0.40 };
  points[362] = { x: 0.55, y: 0.40 };
  points[387] = { x: 0.62, y: 0.40 - 0.03 * eyeScale };
  points[385] = { x: 0.58, y: 0.40 - 0.03 * eyeScale };
  points[373] = { x: 0.62, y: 0.40 + 0.03 * eyeScale };
  points[380] = { x: 0.58, y: 0.40 + 0.03 * eyeScale };

  // Mouth: 61 (m1), 81 (m2), 13 (m3), 311 (m4), 291 (m5), 402 (m6), 14 (m7), 178 (m8)
  points[61] = { x: 0.40, y: 0.65 };
  points[291] = { x: 0.60, y: 0.65 };
  points[81] = { x: 0.46, y: 0.65 - 0.015 * mouthScale };
  points[13] = { x: 0.50, y: 0.65 - 0.020 * mouthScale };
  points[311] = { x: 0.54, y: 0.65 - 0.015 * mouthScale };
  points[402] = { x: 0.54, y: 0.65 + 0.015 * mouthScale };
  points[14] = { x: 0.50, y: 0.65 + 0.020 * mouthScale };
  points[178] = { x: 0.46, y: 0.65 + 0.015 * mouthScale };

  return points;
}

// Helper to create synthetic pose landmark array of 33 points
function createSyntheticPoseLandmarks(options: {
  headForwardShift?: number; // displacement of ear relative to shoulder
  shoulderTiltShift?: number; // vertical difference between shoulders
}): RawLandmarkPoint[] {
  const points: RawLandmarkPoint[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0.0,
  }));

  const earOffset = options.headForwardShift ?? 0.04; // Normal ~11°
  const tiltOffset = options.shoulderTiltShift ?? 0.01; // Normal ~1.5°

  points[0] = { x: 0.50, y: 0.25 }; // Nose
  points[2] = { x: 0.45, y: 0.23 }; // Left eye
  points[5] = { x: 0.55, y: 0.23 }; // Right eye
  points[7] = { x: 0.40 + earOffset, y: 0.25 }; // Left ear
  points[8] = { x: 0.60 + earOffset, y: 0.25 }; // Right ear
  points[11] = { x: 0.40, y: 0.45 }; // Left shoulder
  points[12] = { x: 0.60, y: 0.45 + tiltOffset }; // Right shoulder

  return points;
}

describe('On-Device Vision Signal Math & Feature Extractor', () => {
  it('correctly extracts eye, mouth, and posture landmarks from synthetic fixtures', () => {
    const face = createSyntheticFaceLandmarks({ eyeOpenness: 1.0, mouthOpenness: 1.0 });
    const pose = createSyntheticPoseLandmarks({});

    const eyes = extractEyeLandmarks(face);
    expect(eyes).not.toBeNull();
    expect(eyes!.interOcularDistance).toBeGreaterThan(0.05);

    const mouth = extractMouthLandmarks(face);
    expect(mouth).not.toBeNull();
    expect(mouth!.m1.x).toBe(0.40);
    expect(mouth!.m5.x).toBe(0.60);

    const posture = extractPostureLandmarks(pose);
    expect(posture).not.toBeNull();
    expect(posture!.leftShoulder).toBeDefined();
    expect(posture!.rightShoulder).toBeDefined();
  });

  it('evaluates normal upright posture as high posture score (score >= 80)', () => {
    const face = createSyntheticFaceLandmarks({ eyeOpenness: 1.0 });
    const pose = createSyntheticPoseLandmarks({ headForwardShift: 0.042, shoulderTiltShift: 0.007 });

    const metrics = extractVisionFeatures([face], [pose], DEFAULT_PERSONAL_BASELINE);
    expect(metrics.facePresent).toBe(true);
    expect(metrics.ear).toBeGreaterThan(0.25);
    expect(metrics.isBlink).toBe(false);
    expect(metrics.isYawn).toBe(false);
    expect(metrics.postureScore).toBeGreaterThanOrEqual(80);
  });

  it('detects forward neck / slouching posture and penalizes posture score (< 60)', () => {
    const face = createSyntheticFaceLandmarks({ eyeOpenness: 1.0 });
    // Excessive ear-shoulder forward displacement
    const slouchedPose = createSyntheticPoseLandmarks({ headForwardShift: 0.16, shoulderTiltShift: 0.05 });

    const metrics = extractVisionFeatures([face], [slouchedPose], DEFAULT_PERSONAL_BASELINE);
    expect(metrics.headForwardAngle).toBeGreaterThan(30.0);
    expect(metrics.postureScore).toBeLessThan(65);
  });

  it('detects blink transition when EAR falls below threshold', () => {
    // Eyes closed (0.1 scale)
    const closedEyesFace = createSyntheticFaceLandmarks({ eyeOpenness: 0.15 });
    const pose = createSyntheticPoseLandmarks({});

    const metrics = extractVisionFeatures([closedEyesFace], [pose], DEFAULT_PERSONAL_BASELINE);
    expect(metrics.ear).toBeLessThan(0.18);
    expect(metrics.isBlink).toBe(true);
  });

  it('detects yawning event when MAR exceeds threshold', () => {
    // Mouth open wide (3.5x scale)
    const yawningFace = createSyntheticFaceLandmarks({ eyeOpenness: 1.0, mouthOpenness: 3.5 });
    const pose = createSyntheticPoseLandmarks({});

    const metrics = extractVisionFeatures([yawningFace], [pose], DEFAULT_PERSONAL_BASELINE);
    expect(metrics.mar).toBeGreaterThan(0.55);
    expect(metrics.isYawn).toBe(true);
  });

  it('returns graceful default fallback values when no face/pose is present in frame', () => {
    const metrics = extractVisionFeatures(null, null, DEFAULT_PERSONAL_BASELINE);
    expect(metrics.facePresent).toBe(false);
    expect(metrics.isBlink).toBe(false);
    expect(metrics.isYawn).toBe(false);
    expect(metrics.ear).toBe(0.30);
  });
});
