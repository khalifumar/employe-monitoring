import { describe, it, expect } from 'vitest';
import { calculatePostureScore, type PostureMetrics } from '../src/math/posture-score';
import type { PersonalBaseline } from '../src/types';

describe('calculatePostureScore', () => {
  const baseline: PersonalBaseline = {
    neutralHeadAngle: 12.0,
    neutralShoulderTilt: 2.0,
    neutralInterOcularDistance: 45.0,
    baselineEAR: 0.32,
    calibratedAt: '2026-11-01T08:00:00Z',
  };

  it('returns 100 when current posture matches calibrated baseline exactly', () => {
    const current: PostureMetrics = {
      headForwardAngle: 12.0,
      shoulderTilt: 2.0,
      screenDistanceProxy: 45.0,
    };

    const score = calculatePostureScore(current, baseline);
    expect(score).toBe(100);
  });

  it('penalizes head forward angle deviation (nerd neck)', () => {
    const current: PostureMetrics = {
      headForwardAngle: 32.0, // +20 degrees deviation -> penalty = 20 * 1.5 = 30
      shoulderTilt: 2.0,
      screenDistanceProxy: 45.0,
    };

    const score = calculatePostureScore(current, baseline);
    expect(score).toBe(70);
  });

  it('penalizes shoulder tilt', () => {
    const current: PostureMetrics = {
      headForwardAngle: 12.0,
      shoulderTilt: 12.0, // +10 degrees tilt -> penalty = 10 * 2.0 = 20
      screenDistanceProxy: 45.0,
    };

    const score = calculatePostureScore(current, baseline);
    expect(score).toBe(80);
  });

  it('clamps posture score to min 0 upon extreme deviation', () => {
    const extremePosture: PostureMetrics = {
      headForwardAngle: 85.0,
      shoulderTilt: 45.0,
      screenDistanceProxy: 150.0,
    };

    const score = calculatePostureScore(extremePosture, baseline);
    expect(score).toBe(0);
  });
});
