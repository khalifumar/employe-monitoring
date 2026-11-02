import { describe, it, expect } from 'vitest';
import {
  calculateHeadForwardAngle,
  calculateShoulderTilt,
  calculateScreenDistanceProxy,
} from '../src/math/posture';

describe('calculateHeadForwardAngle', () => {
  it('returns 0 degrees when ear is directly above shoulder (perfect vertical alignment)', () => {
    const ear = { x: 100, y: 50 };
    const shoulder = { x: 100, y: 150 }; // directly below ear

    const angle = calculateHeadForwardAngle(ear, shoulder);
    expect(angle).toBeCloseTo(0.0);
  });

  it('calculates 45 degrees when horizontal offset equals vertical offset', () => {
    const ear = { x: 200, y: 50 };
    const shoulder = { x: 100, y: 150 }; // dx = 100, dy = 100

    const angle = calculateHeadForwardAngle(ear, shoulder);
    expect(angle).toBeCloseTo(45.0);
  });

  it('handles zero vertical distance without dividing by zero', () => {
    const ear = { x: 200, y: 100 };
    const shoulder = { x: 100, y: 100 };

    const angle = calculateHeadForwardAngle(ear, shoulder);
    expect(Number.isFinite(angle)).toBe(true);
  });
});

describe('calculateShoulderTilt', () => {
  it('returns 0 degrees when shoulders are perfectly level', () => {
    const leftShoulder = { x: 80, y: 200 };
    const rightShoulder = { x: 220, y: 200 };

    const tilt = calculateShoulderTilt(leftShoulder, rightShoulder);
    expect(tilt).toBeCloseTo(0.0);
  });

  it('detects shoulder tilt when one shoulder is dropped', () => {
    const leftShoulder = { x: 100, y: 200 };
    const rightShoulder = { x: 200, y: 230 }; // dy = 30, dx = 100

    const tilt = calculateShoulderTilt(leftShoulder, rightShoulder);
    // atan(30 / 100) * 180 / PI = 16.699 degrees
    expect(tilt).toBeCloseTo(16.7, 1);
  });
});

describe('calculateScreenDistanceProxy', () => {
  it('calculates Euclidean inter-ocular distance', () => {
    const leftEye = { x: 120, y: 150 };
    const rightEye = { x: 160, y: 150 };

    const dist = calculateScreenDistanceProxy(leftEye, rightEye);
    expect(dist).toBeCloseTo(40.0);
  });
});
