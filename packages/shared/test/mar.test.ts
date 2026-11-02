import { describe, it, expect } from 'vitest';
import { calculateMAR, updateYawnTracker, type YawnTrackerState } from '../src/math/mar';
import type { MouthLandmarks } from '../src/types';

describe('calculateMAR', () => {
  it('computes realistic MAR for open mouth', () => {
    // horizontal = 10 (m1=0,0, m5=10,0)
    // vertical1 = 6 (m2=(3,3), m8=(3,-3))
    // vertical2 = 8 (m3=(5,4), m7=(5,-4))
    // vertical3 = 6 (m4=(7,3), m6=(7,-3))
    // MAR = (6 + 8 + 6) / (2 * 10) = 20 / 20 = 1.0
    const openMouth: MouthLandmarks = {
      m1: { x: 0, y: 0 },
      m2: { x: 3, y: 3 },
      m3: { x: 5, y: 4 },
      m4: { x: 7, y: 3 },
      m5: { x: 10, y: 0 },
      m6: { x: 7, y: -3 },
      m7: { x: 5, y: -4 },
      m8: { x: 3, y: -3 },
    };

    expect(calculateMAR(openMouth)).toBeCloseTo(1.0);
  });

  it('computes low MAR for closed mouth', () => {
    const closedMouth: MouthLandmarks = {
      m1: { x: 0, y: 0 },
      m2: { x: 3, y: 0.2 },
      m3: { x: 5, y: 0.2 },
      m4: { x: 7, y: 0.2 },
      m5: { x: 10, y: 0 },
      m6: { x: 7, y: -0.2 },
      m7: { x: 5, y: -0.2 },
      m8: { x: 3, y: -0.2 },
    };

    // (0.4 + 0.4 + 0.4) / 20 = 1.2 / 20 = 0.06
    expect(calculateMAR(closedMouth)).toBeCloseTo(0.06);
    expect(calculateMAR(closedMouth)).toBeLessThan(0.60);
  });

  it('handles degenerate points without crashing', () => {
    const zeroMouth: MouthLandmarks = {
      m1: { x: 0, y: 0 },
      m2: { x: 0, y: 0 },
      m3: { x: 0, y: 0 },
      m4: { x: 0, y: 0 },
      m5: { x: 0, y: 0 },
      m6: { x: 0, y: 0 },
      m7: { x: 0, y: 0 },
      m8: { x: 0, y: 0 },
    };
    expect(calculateMAR(zeroMouth)).toBe(0.0);
  });
});

describe('updateYawnTracker', () => {
  it('registers a yawn only if mouth is open for at least minDurationSec', () => {
    let state: YawnTrackerState = { yawnStartMs: null, yawnCount: 0 };

    // T = 0s: Mouth opens (MAR = 0.75 >= 0.6)
    let res = updateYawnTracker(state, 0.75, 0, 0.6, 2.0);
    state = res.nextState;
    expect(state.yawnStartMs).toBe(0);
    expect(state.yawnCount).toBe(0);
    expect(res.justCompletedYawn).toBe(false);

    // T = 1.0s: Still open
    res = updateYawnTracker(state, 0.80, 1000, 0.6, 2.0);
    state = res.nextState;
    expect(state.yawnStartMs).toBe(0);
    expect(state.yawnCount).toBe(0);

    // T = 2.5s: Mouth closes (duration = 2.5s >= 2.0s)
    res = updateYawnTracker(state, 0.10, 2500, 0.6, 2.0);
    state = res.nextState;
    expect(state.yawnStartMs).toBe(null);
    expect(state.yawnCount).toBe(1);
    expect(res.justCompletedYawn).toBe(true);
  });

  it('does NOT count a quick mouth opening (e.g. talking/eating) lasting < 2.0s', () => {
    let state: YawnTrackerState = { yawnStartMs: null, yawnCount: 0 };

    // T = 0s: Mouth opens
    let res = updateYawnTracker(state, 0.75, 0, 0.6, 2.0);
    state = res.nextState;

    // T = 0.8s: Mouth closes immediately
    res = updateYawnTracker(state, 0.20, 800, 0.6, 2.0);
    state = res.nextState;
    expect(state.yawnCount).toBe(0);
    expect(res.justCompletedYawn).toBe(false);
  });
});
