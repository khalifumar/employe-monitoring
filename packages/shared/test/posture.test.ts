import { describe, it, expect } from "vitest";
import {
  calculateHeadForwardAngle,
  calculateShoulderTilt,
  calculateScreenDistanceProxy,
  calculateSlouchRatio,
  calculateNeckAngle,
} from "../src/math/posture";

describe("calculateHeadForwardAngle", () => {
  it("returns 0 degrees when ear is directly above shoulder (perfect vertical alignment)", () => {
    const ear = { x: 100, y: 50 };
    const shoulder = { x: 100, y: 150 }; // directly below ear

    const angle = calculateHeadForwardAngle(ear, shoulder);
    expect(angle).toBeCloseTo(0.0);
  });

  it("calculates 45 degrees when horizontal offset equals vertical offset", () => {
    const ear = { x: 200, y: 50 };
    const shoulder = { x: 100, y: 150 }; // dx = 100, dy = 100

    const angle = calculateHeadForwardAngle(ear, shoulder);
    expect(angle).toBeCloseTo(45.0);
  });

  it("handles zero vertical distance without dividing by zero", () => {
    const ear = { x: 200, y: 100 };
    const shoulder = { x: 100, y: 100 };

    const angle = calculateHeadForwardAngle(ear, shoulder);
    expect(Number.isFinite(angle)).toBe(true);
  });
});

describe("calculateShoulderTilt", () => {
  it("returns 0 degrees when shoulders are perfectly level", () => {
    const leftShoulder = { x: 80, y: 200 };
    const rightShoulder = { x: 220, y: 200 };

    const tilt = calculateShoulderTilt(leftShoulder, rightShoulder);
    expect(tilt).toBeCloseTo(0.0);
  });

  it("detects shoulder tilt when one shoulder is dropped", () => {
    const leftShoulder = { x: 100, y: 200 };
    const rightShoulder = { x: 200, y: 230 }; // dy = 30, dx = 100

    const tilt = calculateShoulderTilt(leftShoulder, rightShoulder);
    // atan(30 / 100) * 180 / PI = 16.699 degrees
    expect(tilt).toBeCloseTo(16.7, 1);
  });
});

describe("calculateScreenDistanceProxy", () => {
  it("calculates Euclidean inter-ocular distance", () => {
    const leftEye = { x: 120, y: 150 };
    const rightEye = { x: 160, y: 150 };

    const dist = calculateScreenDistanceProxy(leftEye, rightEye);
    expect(dist).toBeCloseTo(40.0);
  });
});

describe("PostureGuardAI algorithms: calculateSlouchRatio & calculateNeckAngle", () => {
  it("computes slouch compression ratio accurately", () => {
    const headMid = { x: 150, y: 100 };
    const leftShoulder = { x: 100, y: 200 };
    const rightShoulder = { x: 200, y: 200 };

    // shoulderWidth = 100, shoulderMidY = 200, neckVerticalHeight = 100
    // ratio = 100 / 100 = 1.0 (very upright)
    const ratio = calculateSlouchRatio(headMid, leftShoulder, rightShoulder);
    expect(ratio).toBeCloseTo(1.0);
  });

  it("detects low ratio when head sinks towards shoulders (slouching)", () => {
    const headMid = { x: 150, y: 175 }; // head sank 25px above shoulder
    const leftShoulder = { x: 100, y: 200 };
    const rightShoulder = { x: 200, y: 200 };

    // shoulderWidth = 100, neckVerticalHeight = 25
    // ratio = 25 / 100 = 0.25 (< 0.38 slouch threshold)
    const ratio = calculateSlouchRatio(headMid, leftShoulder, rightShoulder);
    expect(ratio).toBeCloseTo(0.25);
    expect(ratio < 0.38).toBe(true);
  });

  it("calculates aspect-ratio corrected neck angle", () => {
    const ear = { x: 150, y: 100 };
    const shoulder = { x: 150, y: 200 }; // vertically aligned
    const angle = calculateNeckAngle(ear, shoulder, 1.0);
    expect(angle).toBeCloseTo(0.0);
  });
});
