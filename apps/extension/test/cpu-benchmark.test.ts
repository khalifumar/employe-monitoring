import { describe, it, expect } from 'vitest';
import {
  extractVisionFeatures,
  DEFAULT_PERSONAL_BASELINE,
  type RawLandmarkPoint,
} from '../src/lib/vision/feature-extractor';

describe('On-Device Vision CPU & Latency Benchmark', () => {
  it('completes feature extraction in under 5ms per frame (< 5% CPU budget at 2–5 fps)', () => {
    // Generate synthetic face & pose landmarks
    const mockFace: RawLandmarkPoint[] = Array.from({ length: 478 }, (_, i) => ({
      x: 0.35 + (i % 30) * 0.01,
      y: 0.30 + Math.floor(i / 30) * 0.01,
      z: 0.0,
    }));

    const mockPose: RawLandmarkPoint[] = Array.from({ length: 33 }, (_, i) => ({
      x: 0.40 + (i % 10) * 0.02,
      y: 0.35 + Math.floor(i / 10) * 0.02,
      z: 0.0,
    }));

    // Warm-up run
    for (let w = 0; w < 20; w++) {
      extractVisionFeatures([mockFace], [mockPose], DEFAULT_PERSONAL_BASELINE);
    }

    const ITERATIONS = 200;
    const start = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
      const res = extractVisionFeatures([mockFace], [mockPose], DEFAULT_PERSONAL_BASELINE);
      expect(res.facePresent).toBe(true);
    }

    const elapsedMs = performance.now() - start;
    const avgLatencyMs = elapsedMs / ITERATIONS;

    console.log(`[CPU Benchmark] ${ITERATIONS} frames processed in ${elapsedMs.toFixed(2)}ms`);
    console.log(`[CPU Benchmark] Average feature extraction latency: ${avgLatencyMs.toFixed(3)}ms/frame`);

    // Budget: At 2 fps, 5ms execution takes (5ms / 500ms) = 1.0% CPU time.
    // At 5 fps, 5ms execution takes (5ms / 200ms) = 2.5% CPU time.
    // Both are strictly below the project target of < 5% CPU usage.
    expect(avgLatencyMs).toBeLessThan(5.0);
  });
});
