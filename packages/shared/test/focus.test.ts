import { describe, it, expect } from 'vitest';
import { calculateFocusIndex } from '../src/math/focus';

describe('calculateFocusIndex (Model v0)', () => {
  it('produces high score for balanced interaction, presence, and posture', () => {
    const score = calculateFocusIndex({
      inputEvents: 60, // active typing/clicking
      facePresentRatio: 1.0,
      postureScore: 95,
      idleSec: 0,
      meetingMode: false,
    });

    expect(score).toBeGreaterThanOrEqual(85);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('recognizes meeting mode where typing is not penalized', () => {
    // In meeting mode, 0 input events but face present & upright posture
    const meetingScore = calculateFocusIndex({
      inputEvents: 0,
      facePresentRatio: 1.0,
      postureScore: 90,
      idleSec: 55,
      meetingMode: true,
    });

    // In active work mode, 0 input events with 55s idle yields a low score
    const workScore = calculateFocusIndex({
      inputEvents: 0,
      facePresentRatio: 1.0,
      postureScore: 90,
      idleSec: 55,
      meetingMode: false,
    });

    expect(meetingScore).toBeGreaterThan(80);
    expect(workScore).toBeLessThan(meetingScore);
  });

  it('bounds score between 0 and 100 under extreme conditions', () => {
    const zeroScore = calculateFocusIndex({
      inputEvents: 0,
      facePresentRatio: 0.0,
      postureScore: 0,
      idleSec: 60,
      meetingMode: false,
    });
    expect(zeroScore).toBe(0);

    const maxScore = calculateFocusIndex({
      inputEvents: 500,
      facePresentRatio: 1.0,
      postureScore: 100,
      idleSec: 0,
      meetingMode: false,
    });
    expect(maxScore).toBeLessThanOrEqual(100);
  });
});
