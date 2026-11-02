/**
 * Model v0 — Rule-Based Focus Index (Indicator)
 *
 * IMPORTANT DESIGN NOTE (Privacy & Wellbeing Invariant):
 * Focus Index is an INDICATOR of ergonomic engagement and attention rhythm.
 * It is NEVER a punitive "productivity" or "slacking" score.
 * Idle time does NOT imply unproductive time (e.g. reading, thinking, offline notes).
 * In Meeting Mode, presence without typing is treated as valid meeting participation.
 */

export interface FocusInputParams {
  inputEvents: number; // Click, scroll, and key count per minute
  facePresentRatio: number; // 0.0 - 1.0
  postureScore: number; // 0 - 100
  idleSec: number; // 0 - 60
  meetingMode: boolean;
}

/**
 * Calculates rule-based Focus Indicator (0 - 100).
 *
 * Formula components:
 * 1. Interaction component (normalized log scale to prevent typing speed bias):
 *    Normalized between 0 and 1 using saturating log curve (50 events/min ~ 0.8).
 * 2. Visual presence component:
 *    Ratio of face presence during the minute.
 * 3. Ergonomic stability component:
 *    Normalized posture score.
 *
 * If meetingMode is active:
 * Visual presence and active listening are weighted higher, and typing is not required.
 */
export function calculateFocusIndex(params: FocusInputParams): number {
  const { inputEvents, facePresentRatio, postureScore, idleSec, meetingMode } =
    params;

  if (meetingMode) {
    // In meeting mode: listening and visual presence dominate, typing is optional
    const presenceWeight = 0.65;
    const postureWeight = 0.35;
    const postureNorm = Math.max(0, Math.min(1.0, postureScore / 100.0));
    const score =
      (facePresentRatio * presenceWeight + postureNorm * postureWeight) * 100.0;
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  // Active work mode:
  // Activity saturation: 60 events/min is a comfortable moderate pace (~1 event/sec)
  const inputNorm = Math.min(1.0, Math.log1p(inputEvents) / Math.log1p(60));

  // Idle penalty factor: only applies if idle for a significant fraction of minute
  const activeRatio = Math.max(0, (60 - idleSec) / 60);

  const postureNorm = Math.max(0, Math.min(1.0, postureScore / 100.0));

  // Balanced weighting: 40% input interaction, 35% screen presence, 25% posture stability
  const weightedScore =
    (0.4 * inputNorm * activeRatio +
      0.35 * facePresentRatio +
      0.25 * postureNorm) *
    100.0;

  return Math.round(Math.max(0, Math.min(100, weightedScore)));
}
