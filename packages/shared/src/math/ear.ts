import type { EyeLandmarks, Point2D } from "../types";

/**
 * Calculates Euclidean distance between two 2D points.
 */
export function euclideanDistance(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates Eye Aspect Ratio (EAR) based on Soukupová and Čech (2016).
 *
 * EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)
 *
 * @param eye 6-point landmarks for a single eye
 * @returns EAR value between 0.0 and 1.0 (clamped)
 */
export function calculateEAR(eye: EyeLandmarks): number {
  const vertical1 = euclideanDistance(eye.p2, eye.p6);
  const vertical2 = euclideanDistance(eye.p3, eye.p5);
  const horizontal = euclideanDistance(eye.p1, eye.p4);

  // Avoid division by zero if points are degenerate
  if (horizontal <= 1e-6) {
    return 0.0;
  }

  const ear = (vertical1 + vertical2) / (2.0 * horizontal);
  // Clamped to realistic valid range
  return Math.max(0.0, Math.min(1.0, ear));
}

/**
 * Calculates mean EAR between left and right eye.
 */
export function calculateMeanEAR(
  leftEye: EyeLandmarks,
  rightEye: EyeLandmarks,
): number {
  const leftEAR = calculateEAR(leftEye);
  const rightEAR = calculateEAR(rightEye);
  return (leftEAR + rightEAR) / 2.0;
}
