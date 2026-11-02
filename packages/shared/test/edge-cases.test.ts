import { describe, it, expect } from 'vitest';
import { updateYawnTracker, type YawnTrackerState } from '../src/math/mar';
import { getStandardDeviation, type RunningStats } from '../src/math/normalization';
import { calculatePostureScore } from '../src/math/posture-score';
import type { PersonalBaseline } from '../src/types';

describe('Signal Math Edge Coverage', () => {
  it('handles idle tracker state when mouth remains closed', () => {
    const idleState: YawnTrackerState = { yawnStartMs: null, yawnCount: 3 };
    const res = updateYawnTracker(idleState, 0.15, 5000);
    expect(res.nextState.yawnStartMs).toBe(null);
    expect(res.nextState.yawnCount).toBe(3);
    expect(res.justCompletedYawn).toBe(false);
  });

  it('returns 0 std dev when running stats count is less than 2', () => {
    const emptyStats: RunningStats = { count: 0, mean: 0, m2: 0 };
    expect(getStandardDeviation(emptyStats)).toBe(0);

    const singleStats: RunningStats = { count: 1, mean: 42, m2: 0 };
    expect(getStandardDeviation(singleStats)).toBe(0);
  });

  it('handles baseline with 0 neutral distance safely', () => {
    const zeroDistanceBaseline: PersonalBaseline = {
      neutralHeadAngle: 10,
      neutralShoulderTilt: 0,
      neutralInterOcularDistance: 0,
      baselineEAR: 0.3,
      calibratedAt: '2026-11-01T00:00:00Z',
    };

    const score = calculatePostureScore(
      { headForwardAngle: 10, shoulderTilt: 0, screenDistanceProxy: 50 },
      zeroDistanceBaseline
    );
    expect(score).toBe(100);
  });
});
