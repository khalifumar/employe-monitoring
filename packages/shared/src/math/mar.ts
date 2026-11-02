import type { MouthLandmarks } from '../types';
import { MAR_DEFAULT_YAWN_THRESHOLD, YAWN_MIN_DURATION_SECONDS } from '../constants';
import { euclideanDistance } from './ear';

/**
 * Calculates Mouth Aspect Ratio (MAR) for yawn detection.
 *
 * MAR = (||m2 - m8|| + ||m3 - m7|| + ||m4 - m6||) / (2 * ||m1 - m5||)
 *
 * @param mouth 8-point mouth landmarks
 * @returns MAR value clamped to [0, 2.0]
 */
export function calculateMAR(mouth: MouthLandmarks): number {
  const v1 = euclideanDistance(mouth.m2, mouth.m8);
  const v2 = euclideanDistance(mouth.m3, mouth.m7);
  const v3 = euclideanDistance(mouth.m4, mouth.m6);
  const horizontal = euclideanDistance(mouth.m1, mouth.m5);

  if (horizontal <= 1e-6) {
    return 0.0;
  }

  const mar = (v1 + v2 + v3) / (2.0 * horizontal);
  return Math.max(0.0, Math.min(2.5, mar));
}

export interface YawnTrackerState {
  yawnStartMs: number | null;
  yawnCount: number;
}

/**
 * Updates yawn tracking state given a new MAR reading.
 * A yawn is registered when MAR >= threshold for at least durationSec seconds.
 */
export function updateYawnTracker(
  state: YawnTrackerState,
  currentMAR: number,
  timestampMs: number,
  threshold: number = MAR_DEFAULT_YAWN_THRESHOLD,
  minDurationSec: number = YAWN_MIN_DURATION_SECONDS
): { nextState: YawnTrackerState; justCompletedYawn: boolean } {
  const isOpen = currentMAR >= threshold;

  if (isOpen) {
    if (state.yawnStartMs === null) {
      // Yawn started
      return {
        nextState: {
          yawnStartMs: timestampMs,
          yawnCount: state.yawnCount,
        },
        justCompletedYawn: false,
      };
    } else {
      // Yawn continuing
      return {
        nextState: state,
        justCompletedYawn: false,
      };
    }
  } else {
    // Mouth closed or below threshold
    if (state.yawnStartMs !== null) {
      const durationSec = (timestampMs - state.yawnStartMs) / 1000.0;
      const wasYawn = durationSec >= minDurationSec;
      return {
        nextState: {
          yawnStartMs: null,
          yawnCount: wasYawn ? state.yawnCount + 1 : state.yawnCount,
        },
        justCompletedYawn: wasYawn,
      };
    }
    return {
      nextState: state,
      justCompletedYawn: false,
    };
  }
}
