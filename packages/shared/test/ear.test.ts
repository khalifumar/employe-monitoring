import { describe, it, expect } from "vitest";
import {
  calculateEAR,
  calculateMeanEAR,
  euclideanDistance,
} from "../src/math/ear";
import type { EyeLandmarks } from "../src/types";

describe("euclideanDistance", () => {
  it("calculates 3-4-5 right triangle distance correctly", () => {
    const dist = euclideanDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
    expect(dist).toBeCloseTo(5.0);
  });

  it("returns 0 for identical points", () => {
    const dist = euclideanDistance({ x: 10.5, y: 20.2 }, { x: 10.5, y: 20.2 });
    expect(dist).toBe(0);
  });
});

describe("calculateEAR", () => {
  it("computes correct EAR for open eye geometry", () => {
    // p1=(0, 0), p4=(10, 0) -> horizontal = 10
    // p2=(3, 2), p6=(3, -2) -> vertical1 = 4
    // p3=(7, 2), p5=(7, -2) -> vertical2 = 4
    // EAR = (4 + 4) / (2 * 10) = 8 / 20 = 0.40
    const openEye: EyeLandmarks = {
      p1: { x: 0, y: 0 },
      p2: { x: 3, y: 2 },
      p3: { x: 7, y: 2 },
      p4: { x: 10, y: 0 },
      p5: { x: 7, y: -2 },
      p6: { x: 3, y: -2 },
    };

    const ear = calculateEAR(openEye);
    expect(ear).toBeCloseTo(0.4);
  });

  it("computes correct EAR for closed eye geometry", () => {
    // vertical distance almost zero
    const closedEye: EyeLandmarks = {
      p1: { x: 0, y: 0 },
      p2: { x: 3, y: 0.1 },
      p3: { x: 7, y: 0.1 },
      p4: { x: 10, y: 0 },
      p5: { x: 7, y: -0.1 },
      p6: { x: 3, y: -0.1 },
    };

    const ear = calculateEAR(closedEye);
    // (0.2 + 0.2) / 20 = 0.02
    expect(ear).toBeCloseTo(0.02);
    expect(ear).toBeLessThan(0.21); // triggers blink threshold
  });

  it("handles degenerate zero-width eye gracefully without NaN", () => {
    const degenerateEye: EyeLandmarks = {
      p1: { x: 5, y: 5 },
      p2: { x: 5, y: 5 },
      p3: { x: 5, y: 5 },
      p4: { x: 5, y: 5 },
      p5: { x: 5, y: 5 },
      p6: { x: 5, y: 5 },
    };

    expect(calculateEAR(degenerateEye)).toBe(0.0);
  });

  it("clamps values above 1.0", () => {
    // extreme vertical height
    const tallEye: EyeLandmarks = {
      p1: { x: 0, y: 0 },
      p2: { x: 5, y: 50 },
      p3: { x: 5, y: 50 },
      p4: { x: 10, y: 0 },
      p5: { x: 5, y: -50 },
      p6: { x: 5, y: -50 },
    };

    expect(calculateEAR(tallEye)).toBe(1.0);
  });
});

describe("calculateMeanEAR", () => {
  it("averages left and right EAR accurately", () => {
    const eyeA: EyeLandmarks = {
      p1: { x: 0, y: 0 },
      p2: { x: 5, y: 2 },
      p3: { x: 5, y: 2 },
      p4: { x: 10, y: 0 },
      p5: { x: 5, y: -2 },
      p6: { x: 5, y: -2 },
    }; // vertical = 4+4=8, horizontal = 2*10=20 -> EAR = 8 / 20 = 0.40

    const eyeB: EyeLandmarks = {
      p1: { x: 0, y: 0 },
      p2: { x: 5, y: 4 },
      p3: { x: 5, y: 4 },
      p4: { x: 10, y: 0 },
      p5: { x: 5, y: -4 },
      p6: { x: 5, y: -4 },
    }; // vertical = 8+8=16, horizontal = 2*10=20 -> EAR = 16 / 20 = 0.80

    expect(calculateMeanEAR(eyeA, eyeB)).toBeCloseTo(0.6);
  });
});
