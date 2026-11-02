import type { PersonalBaseline } from "../types";
import { POSTURE_SCORE_BASE } from "../constants";

export interface PostureMetrics {
  headForwardAngle: number;
  shoulderTilt: number;
  screenDistanceProxy: number;
}

export interface PostureWeights {
  headAngleWeight: number; // penalty points per degree deviation
  shoulderTiltWeight: number; // penalty points per degree deviation
  distanceDeviationWeight: number; // penalty points per 10% change in screen distance
}

export const DEFAULT_POSTURE_WEIGHTS: PostureWeights = {
  headAngleWeight: 1.5,
  shoulderTiltWeight: 2.0,
  distanceDeviationWeight: 15.0,
};

/**
 * Calculates ergonomic Posture Score (0 - 100) compared against calibrated neutral baseline.
 * 100 = perfect alignment with personal baseline.
 * Lower scores indicate slouching, forward neck, or tilted shoulders.
 */
export function calculatePostureScore(
  current: PostureMetrics,
  baseline: PersonalBaseline,
  weights: PostureWeights = DEFAULT_POSTURE_WEIGHTS,
): number {
  // Deviation from calibrated neutral head angle
  const headAngleDelta = Math.max(
    0,
    current.headForwardAngle - baseline.neutralHeadAngle,
  );

  // Deviation from calibrated neutral shoulder tilt
  const shoulderTiltDelta = Math.max(
    0,
    current.shoulderTilt - baseline.neutralShoulderTilt,
  );

  // Relative deviation in screen distance (leaning too far in or slouching back)
  const distanceRatio =
    baseline.neutralInterOcularDistance > 0
      ? Math.abs(
          current.screenDistanceProxy - baseline.neutralInterOcularDistance,
        ) / baseline.neutralInterOcularDistance
      : 0;

  const penalty =
    headAngleDelta * weights.headAngleWeight +
    shoulderTiltDelta * weights.shoulderTiltWeight +
    distanceRatio * weights.distanceDeviationWeight;

  const score = POSTURE_SCORE_BASE - penalty;
  return Math.round(Math.max(0, Math.min(100, score)));
}
