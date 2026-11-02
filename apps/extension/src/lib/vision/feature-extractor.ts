import {
  calculateEAR,
  calculateMAR,
  calculateHeadForwardAngle,
  calculateShoulderTilt,
  calculatePostureScore,
  type EyeLandmarks,
  type MouthLandmarks,
  type PostureLandmarks,
  type PersonalBaseline,
  type Point2D,
} from '@selaras/shared';

export interface RawLandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

export interface ExtractedVisionMetrics {
  facePresent: boolean;
  ear: number;
  isBlink: boolean;
  mar: number;
  isYawn: boolean;
  interOcularDistance: number;
  headForwardAngle: number;
  shoulderTilt: number;
  postureScore: number;
}

export const DEFAULT_PERSONAL_BASELINE: PersonalBaseline = {
  neutralHeadAngle: 12.0,
  neutralShoulderTilt: 2.0,
  neutralInterOcularDistance: 0.12,
  baselineEAR: 0.30,
  calibratedAt: '2026-01-01T00:00:00.000Z',
};

/**
 * Extracts MediaPipe Face Landmarker 6-point eye sets.
 * Left Eye indices: 33 (outer), 160 (p2), 158 (p3), 133 (inner), 153 (p5), 144 (p6)
 * Right Eye indices: 263 (outer), 387 (p2), 385 (p3), 362 (inner), 380 (p5), 373 (p6)
 */
export function extractEyeLandmarks(landmarks: RawLandmarkPoint[]): {
  leftEye: EyeLandmarks;
  rightEye: EyeLandmarks;
  interOcularDistance: number;
} | null {
  if (!landmarks || landmarks.length < 468) return null;

  const pt = (idx: number): Point2D => ({
    x: landmarks[idx]?.x ?? 0,
    y: landmarks[idx]?.y ?? 0,
  });

  const leftEye: EyeLandmarks = {
    p1: pt(33),
    p2: pt(160),
    p3: pt(158),
    p4: pt(133),
    p5: pt(153),
    p6: pt(144),
  };

  const rightEye: EyeLandmarks = {
    p1: pt(263),
    p2: pt(387),
    p3: pt(385),
    p4: pt(362),
    p5: pt(380),
    p6: pt(373),
  };

  // Euclidean distance between inner eye corners (133 and 362)
  const dx = rightEye.p4.x - leftEye.p4.x;
  const dy = rightEye.p4.y - leftEye.p4.y;
  const interOcularDistance = Math.hypot(dx, dy);

  return { leftEye, rightEye, interOcularDistance };
}

/**
 * Extracts MediaPipe Face Landmarker 8-point mouth set for MAR.
 * Indices: 61 (m1), 81 (m2), 13 (m3), 311 (m4), 291 (m5), 402 (m6), 14 (m7), 178 (m8)
 */
export function extractMouthLandmarks(landmarks: RawLandmarkPoint[]): MouthLandmarks | null {
  if (!landmarks || landmarks.length < 468) return null;

  const pt = (idx: number): Point2D => ({
    x: landmarks[idx]?.x ?? 0,
    y: landmarks[idx]?.y ?? 0,
  });

  return {
    m1: pt(61),
    m2: pt(81),
    m3: pt(13),
    m4: pt(311),
    m5: pt(291),
    m6: pt(402),
    m7: pt(14),
    m8: pt(178),
  };
}

/**
 * Extracts MediaPipe Pose Landmarker subset for posture angles.
 * Indices: 0 (nose), 2 (left eye), 5 (right eye), 7 (left ear), 8 (right ear), 11 (left shoulder), 12 (right shoulder)
 */
export function extractPostureLandmarks(landmarks: RawLandmarkPoint[]): PostureLandmarks | null {
  if (!landmarks || landmarks.length < 13) return null;

  const pt = (idx: number): Point2D => ({
    x: landmarks[idx]?.x ?? 0,
    y: landmarks[idx]?.y ?? 0,
  });

  return {
    nose: pt(0),
    leftEye: pt(2),
    rightEye: pt(5),
    leftEar: pt(7),
    rightEar: pt(8),
    leftShoulder: pt(11),
    rightShoulder: pt(12),
  };
}

/**
 * Main feature extraction entrypoint.
 * Transforms raw MediaPipe results into strict numeric features.
 * Memory Invariant: Caller must discard input raw landmarks immediately after calling.
 */
export function extractVisionFeatures(
  faceLandmarksList: RawLandmarkPoint[][] | null | undefined,
  poseLandmarksList: RawLandmarkPoint[][] | null | undefined,
  baseline: PersonalBaseline = DEFAULT_PERSONAL_BASELINE
): ExtractedVisionMetrics {
  const hasFace = !!(faceLandmarksList && faceLandmarksList.length > 0 && faceLandmarksList[0]);
  const hasPose = !!(poseLandmarksList && poseLandmarksList.length > 0 && poseLandmarksList[0]);

  if (!hasFace && !hasPose) {
    return {
      facePresent: false,
      ear: 0.30,
      isBlink: false,
      mar: 0.20,
      isYawn: false,
      interOcularDistance: baseline.neutralInterOcularDistance,
      headForwardAngle: baseline.neutralHeadAngle,
      shoulderTilt: baseline.neutralShoulderTilt,
      postureScore: 90,
    };
  }

  let ear = 0.30;
  let isBlink = false;
  let mar = 0.20;
  let isYawn = false;
  let interOcularDistance = baseline.neutralInterOcularDistance;

  if (hasFace && faceLandmarksList[0]) {
    const eyes = extractEyeLandmarks(faceLandmarksList[0]);
    if (eyes) {
      const leftEar = calculateEAR(eyes.leftEye);
      const rightEar = calculateEAR(eyes.rightEye);
      ear = (leftEar + rightEar) / 2;
      interOcularDistance = eyes.interOcularDistance;

      // Dynamic blink threshold based on calibrated baseline EAR
      const blinkThreshold = Math.min(0.21, baseline.baselineEAR * 0.75);
      isBlink = ear < blinkThreshold;
    }

    const mouth = extractMouthLandmarks(faceLandmarksList[0]);
    if (mouth) {
      mar = calculateMAR(mouth);
      isYawn = mar > 0.55;
    }
  }

  let headForwardAngle = baseline.neutralHeadAngle;
  let shoulderTilt = baseline.neutralShoulderTilt;

  if (hasPose && poseLandmarksList[0]) {
    const postureLm = extractPostureLandmarks(poseLandmarksList[0]);
    if (postureLm) {
      if (postureLm.leftEar && postureLm.leftShoulder) {
        headForwardAngle = calculateHeadForwardAngle(postureLm.leftEar, postureLm.leftShoulder);
      } else if (postureLm.rightEar && postureLm.rightShoulder) {
        headForwardAngle = calculateHeadForwardAngle(postureLm.rightEar, postureLm.rightShoulder);
      }
      if (postureLm.leftShoulder && postureLm.rightShoulder) {
        shoulderTilt = calculateShoulderTilt(postureLm.leftShoulder, postureLm.rightShoulder);
      }
    }
  }

  const postureScore = calculatePostureScore(
    {
      headForwardAngle,
      shoulderTilt,
      screenDistanceProxy: interOcularDistance,
    },
    baseline
  );

  return {
    facePresent: hasFace,
    ear: Number(ear.toFixed(4)),
    isBlink,
    mar: Number(mar.toFixed(4)),
    isYawn,
    interOcularDistance: Number(interOcularDistance.toFixed(4)),
    headForwardAngle: Number(headForwardAngle.toFixed(2)),
    shoulderTilt: Number(shoulderTilt.toFixed(2)),
    postureScore: Math.round(postureScore),
  };
}
