import { describe, it, expect } from "vitest";
import {
  calculateZScore,
  updateRunningStats,
  getStandardDeviation,
  type RunningStats,
} from "../src/math/normalization";

describe("calculateZScore", () => {
  it("computes 0 when value equals mean", () => {
    expect(calculateZScore(50, 50, 5)).toBe(0);
  });

  it("computes +2.0 when value is 2 standard deviations above mean", () => {
    expect(calculateZScore(60, 50, 5)).toBeCloseTo(2.0);
  });

  it("safely handles zero std without division by zero", () => {
    const z = calculateZScore(50, 50, 0);
    expect(Number.isFinite(z)).toBe(true);
    expect(z).toBe(0);
  });
});

describe("Welford incremental running stats", () => {
  it("correctly tracks sample mean and sample standard deviation", () => {
    const samples = [10, 20, 30, 40, 50];
    let stats: RunningStats = { count: 0, mean: 0, m2: 0 };

    for (const val of samples) {
      stats = updateRunningStats(stats, val);
    }

    expect(stats.count).toBe(5);
    expect(stats.mean).toBe(30);

    // Sample variance of [10, 20, 30, 40, 50] is 250, std = sqrt(250) ~ 15.811
    const std = getStandardDeviation(stats);
    expect(std).toBeCloseTo(15.811, 2);
  });
});
