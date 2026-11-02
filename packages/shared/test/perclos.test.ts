import { describe, it, expect } from "vitest";
import { calculatePERCLOS, type EARObservation } from "../src/math/perclos";

describe("calculatePERCLOS", () => {
  it("returns 0 when observations array is empty", () => {
    expect(calculatePERCLOS([])).toBe(0.0);
  });

  it("calculates 100% closure when all points are below threshold", () => {
    const now = 100_000;
    const observations: EARObservation[] = [
      { ear: 0.1, timestampMs: now - 30_000 },
      { ear: 0.12, timestampMs: now - 20_000 },
      { ear: 0.15, timestampMs: now - 10_000 },
      { ear: 0.08, timestampMs: now },
    ];

    const perclos = calculatePERCLOS(observations, 0.21, 60_000, now);
    expect(perclos).toBe(1.0);
  });

  it("calculates 50% closure when half of points are closed within the window", () => {
    const now = 100_000;
    const observations: EARObservation[] = [
      { ear: 0.35, timestampMs: now - 30_000 }, // open
      { ear: 0.1, timestampMs: now - 20_000 }, // closed
      { ear: 0.38, timestampMs: now - 10_000 }, // open
      { ear: 0.09, timestampMs: now }, // closed
    ];

    const perclos = calculatePERCLOS(observations, 0.21, 60_000, now);
    expect(perclos).toBe(0.5);
  });

  it("discards observations older than the 60s rolling window", () => {
    const now = 100_000;
    const observations: EARObservation[] = [
      { ear: 0.05, timestampMs: now - 90_000 }, // outside 60s window (ignored)
      { ear: 0.05, timestampMs: now - 70_000 }, // outside 60s window (ignored)
      { ear: 0.35, timestampMs: now - 10_000 }, // inside (open)
      { ear: 0.32, timestampMs: now }, // inside (open)
    ];

    const perclos = calculatePERCLOS(observations, 0.21, 60_000, now);
    expect(perclos).toBe(0.0);
  });

  it("returns 0 if all points are outside the requested window", () => {
    const now = 200_000;
    const observations: EARObservation[] = [{ ear: 0.05, timestampMs: 10_000 }];

    expect(calculatePERCLOS(observations, 0.21, 60_000, now)).toBe(0.0);
  });
});
