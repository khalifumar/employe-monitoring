import { z } from "zod";

export const Point2DSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const Point3DSchema = Point2DSchema.extend({
  z: z.number().optional(),
});

export const EyeLandmarksSchema = z.object({
  p1: Point2DSchema,
  p2: Point2DSchema,
  p3: Point2DSchema,
  p4: Point2DSchema,
  p5: Point2DSchema,
  p6: Point2DSchema,
});

export const MouthLandmarksSchema = z.object({
  m1: Point2DSchema,
  m2: Point2DSchema,
  m3: Point2DSchema,
  m4: Point2DSchema,
  m5: Point2DSchema,
  m6: Point2DSchema,
  m7: Point2DSchema,
  m8: Point2DSchema,
});

export const TelemetryPayloadSchema = z.object({
  user_pseudo_id: z.string().uuid().or(z.string().min(8)),
  ts_minute: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
  ear_mean: z.number().min(0).max(1),
  perclos: z.number().min(0).max(1),
  blink_rate: z.number().min(0).max(120),
  yawn_count: z.number().int().min(0).max(30),
  head_forward_angle: z.number().min(-90).max(90),
  shoulder_tilt: z.number().min(0).max(90),
  posture_score: z.number().min(0).max(100),
  face_present_ratio: z.number().min(0).max(1),
  sitting_continuous_min: z.number().min(0),
  idle_sec: z.number().min(0).max(60),
  input_events: z.number().int().min(0),
  tab_category: z
    .enum(["work", "communication", "leisure", "other"])
    .nullable(),
  meeting_mode: z.boolean(),
});

export const ConsentSettingsSchema = z.object({
  drowsiness_detection: z.boolean(),
  posture_detection: z.boolean(),
  activity_tracking: z.boolean(),
  task_timer: z.boolean(),
  tab_category_opt_in: z.boolean(),
  manager_individual_view_opt_in: z.boolean(),
  last_updated: z.string(),
});

export const SelfReportSchema = z.object({
  user_id: z.string(),
  ts: z.string(),
  kss_score: z.number().int().min(1).max(9),
  workload_score: z.number().int().min(1).max(5),
  burnout_item: z.number().int().min(1).max(5),
});

export const TaskItemSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string().min(1).max(200),
  estimated_min: z.number().int().positive().nullable(),
  started_at: z.string(),
  completed_at: z.string().nullable(),
  cycle_time_sec: z.number().nonnegative().nullable(),
});

export const PersonalBaselineSchema = z.object({
  neutralHeadAngle: z.number(),
  neutralShoulderTilt: z.number(),
  neutralInterOcularDistance: z.number().positive(),
  baselineEAR: z.number().positive(),
  calibratedAt: z.string(),
});
