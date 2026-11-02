/**
 * Normalization utilities for personal baseline comparison.
 * Allows comparing individuals against their own baseline rather than a universal standard.
 */

/**
 * Calculates z-score: (value - mean) / std.
 * Protects against division by zero if std is negligible.
 */
export function calculateZScore(
  value: number,
  mean: number,
  std: number,
  minStd = 1e-4,
): number {
  const safeStd = Math.max(minStd, std);
  return (value - mean) / safeStd;
}

export interface RunningStats {
  count: number;
  mean: number;
  m2: number; // Sum of squared differences from mean (Welford's algorithm)
}

/**
 * Welford's algorithm for numerically stable incremental mean and variance computation.
 */
export function updateRunningStats(
  stats: RunningStats,
  newValue: number,
): RunningStats {
  const newCount = stats.count + 1;
  const delta = newValue - stats.mean;
  const newMean = stats.mean + delta / newCount;
  const delta2 = newValue - newMean;
  const newM2 = stats.m2 + delta * delta2;

  return {
    count: newCount,
    mean: newMean,
    m2: newM2,
  };
}

/**
 * Computes standard deviation from running stats.
 */
export function getStandardDeviation(stats: RunningStats): number {
  if (stats.count < 2) {
    return 0.0;
  }
  return Math.sqrt(stats.m2 / (stats.count - 1));
}
