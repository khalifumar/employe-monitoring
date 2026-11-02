import { describe, it, expect } from "vitest";
import {
  TelemetryPayloadSchema,
  ConsentSettingsSchema,
  SelfReportSchema,
  TaskItemSchema,
} from "../src/schemas";

describe("Zod Validation Schemas", () => {
  it("validates a correct telemetry payload", () => {
    const validPayload = {
      user_pseudo_id: "123e4567-e89b-12d3-a456-426614174000",
      ts_minute: "2026-11-02T10:15:00.000Z",
      ear_mean: 0.31,
      perclos: 0.08,
      blink_rate: 16.5,
      yawn_count: 0,
      head_forward_angle: 14.2,
      shoulder_tilt: 2.1,
      posture_score: 92,
      face_present_ratio: 0.98,
      sitting_continuous_min: 42,
      idle_sec: 5,
      input_events: 84,
      tab_category: "work" as const,
      meeting_mode: false,
    };

    const parsed = TelemetryPayloadSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it("rejects telemetry payload with out-of-range values", () => {
    const invalidPayload = {
      user_pseudo_id: "short", // invalid id
      ts_minute: "invalid-date",
      ear_mean: 2.5, // out of [0, 1]
      perclos: -0.1, // out of [0, 1]
      blink_rate: 500, // out of [0, 120]
      yawn_count: -1,
      head_forward_angle: 120, // out of range
      shoulder_tilt: 95,
      posture_score: 150, // out of [0, 100]
      face_present_ratio: 1.5,
      sitting_continuous_min: -5,
      idle_sec: 75, // max 60
      input_events: -10,
      tab_category: "unauthorized_category",
      meeting_mode: "not_a_bool",
    };

    const parsed = TelemetryPayloadSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it("validates consent settings structure", () => {
    const consent = {
      drowsiness_detection: true,
      posture_detection: true,
      activity_tracking: true,
      task_timer: true,
      tab_category_opt_in: false,
      manager_individual_view_opt_in: false,
      last_updated: "2026-11-02T10:00:00Z",
    };

    expect(ConsentSettingsSchema.safeParse(consent).success).toBe(true);
  });

  it("validates self-report scale bounds (KSS 1-9, workload 1-5, burnout 1-5)", () => {
    const validReport = {
      user_id: "user-abc-123",
      ts: "2026-11-02T11:30:00Z",
      kss_score: 7,
      workload_score: 4,
      burnout_item: 3,
    };
    expect(SelfReportSchema.safeParse(validReport).success).toBe(true);

    const invalidReport = {
      user_id: "user-abc-123",
      ts: "2026-11-02T11:30:00Z",
      kss_score: 12, // exceeds 9
      workload_score: 0, // below 1
      burnout_item: 6, // exceeds 5
    };
    expect(SelfReportSchema.safeParse(invalidReport).success).toBe(false);
  });

  it("validates task item schema", () => {
    const task = {
      id: "task-101",
      user_id: "user-abc-123",
      title: "Analyze customer survey data",
      estimated_min: 45,
      started_at: "2026-11-02T09:00:00Z",
      completed_at: "2026-11-02T09:42:00Z",
      cycle_time_sec: 2520,
    };
    expect(TaskItemSchema.safeParse(task).success).toBe(true);
  });
});
