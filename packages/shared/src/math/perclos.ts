import { EAR_DEFAULT_THRESHOLD } from "../constants";

export interface EARObservation {
  ear: number;
  timestampMs: number;
}

/**
 * Calculates PERCLOS (Percentage of Eye Closure) over a rolling window.
 * Standard P80 criterion: Proportion of time in the time window where the eyes
 * are at least 80% closed (EAR falls below the closure threshold).
 *
 * @param observations Chronological list of EAR observations
 * @param earThreshold EAR cutoff below which the eye is considered closed
 * @param windowMs Window duration in milliseconds (default: 60,000ms = 60s)
 * @param currentTimeMs Reference timestamp (defaults to latest observation timestamp)
 * @returns PERCLOS ratio between 0.0 and 1.0
 */
export function calculatePERCLOS(
  observations: EARObservation[],
  earThreshold: number = EAR_DEFAULT_THRESHOLD,
  windowMs: number = 60_000,
  currentTimeMs?: number,
): number {
  if (observations.length === 0) {
    return 0.0;
  }

  const latestTime =
    currentTimeMs ?? observations[observations.length - 1]!.timestampMs;
  const windowStart = latestTime - windowMs;

  const validObservations = observations.filter(
    (obs) => obs.timestampMs >= windowStart && obs.timestampMs <= latestTime,
  );

  if (validObservations.length === 0) {
    return 0.0;
  }

  let closedCount = 0;
  for (const obs of validObservations) {
    if (obs.ear < earThreshold) {
      closedCount++;
    }
  }

  return closedCount / validObservations.length;
}
