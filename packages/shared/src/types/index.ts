/**
 * Core domain types for Selaras
 * Privacy Invariant: Raw video frames, image data, and raw landmark coordinates are NEVER transmitted.
 * Only aggregated numeric features are modeled here.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z?: number;
}

/**
 * 6-point eye landmark representation (MediaPipe Face Landmarker subset)
 * p1: outer corner, p4: inner corner
 * p2, p3: upper eyelid points
 * p5, p6: lower eyelid points
 */
export interface EyeLandmarks {
  p1: Point2D;
  p2: Point2D;
  p3: Point2D;
  p4: Point2D;
  p5: Point2D;
  p6: Point2D;
}

/**
 * Mouth landmark representation for Mouth Aspect Ratio (MAR)
 * m1: left corner, m5: right corner
 * m2, m3, m4: upper lip points
 * m6, m7, m8: lower lip points
 */
export interface MouthLandmarks {
  m1: Point2D;
  m2: Point2D;
  m3: Point2D;
  m4: Point2D;
  m5: Point2D;
  m6: Point2D;
  m7: Point2D;
  m8: Point2D;
}

/**
 * Posture landmark subset from MediaPipe Pose Landmarker
 */
export interface PostureLandmarks {
  leftEar?: Point2D;
  rightEar?: Point2D;
  leftShoulder?: Point2D;
  rightShoulder?: Point2D;
  nose?: Point2D;
  leftEye?: Point2D;
  rightEye?: Point2D;
}

/**
 * Personal baseline calibration recorded during the employee's first neutral sitting sessions
 */
export interface PersonalBaseline {
  neutralHeadAngle: number;
  neutralShoulderTilt: number;
  neutralInterOcularDistance: number;
  baselineEAR: number;
  calibratedAt: string;
}

/**
 * Exact 1-minute telemetry payload sent from extension service worker to Supabase.
 * Strictly limited to numeric aggregated signals.
 */
export interface TelemetryPayload {
  user_pseudo_id: string;
  ts_minute: string; // ISO 8601 timestamp truncated to minute
  ear_mean: number;
  perclos: number;
  blink_rate: number; // blinks per minute
  yawn_count: number;
  head_forward_angle: number;
  shoulder_tilt: number;
  posture_score: number; // 0 - 100
  face_present_ratio: number; // 0.0 - 1.0
  sitting_continuous_min: number;
  idle_sec: number;
  input_events: number; // Sum of clicks + scrolls + keypress counts (no content)
  tab_category: "work" | "communication" | "leisure" | "other" | null;
  meeting_mode: boolean;
}

/**
 * Granular employee consent preferences
 */
export interface ConsentSettings {
  drowsiness_detection: boolean;
  posture_detection: boolean;
  activity_tracking: boolean;
  task_timer: boolean;
  tab_category_opt_in: boolean;
  manager_individual_view_opt_in: boolean;
  last_updated: string;
}

export type UserRole = "admin" | "manager" | "employee";

export interface UserProfile {
  id: string;
  org_id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface TaskItem {
  id: string;
  user_id: string;
  title: string;
  estimated_min: number | null;
  started_at: string;
  completed_at: string | null;
  cycle_time_sec: number | null;
}

export interface SelfReport {
  id: string;
  user_id: string;
  ts: string;
  kss_score: number; // 1-9 Karolinska Sleepiness Scale
  workload_score: number; // 1-5 subjective workload
  burnout_item: number; // 1-5 emotional exhaustion item
}

export type FatigueRiskLevel = "low" | "moderate" | "high";
export type FocusIndicatorLevel = "steady" | "fluctuating" | "low";

export interface RiskFactorContribution {
  factor: string;
  impact: number; // relative SHAP value or rule weight
}

export interface RiskScore {
  id: string;
  user_id: string;
  team_id: string;
  date: string;
  hour: number;
  fatigue_risk_level: FatigueRiskLevel;
  focus_indicator_level: FocusIndicatorLevel;
  top_factors: RiskFactorContribution[];
}

/**
 * Aggregated team level view complying with k-anonymity (k >= 5)
 */
export interface TeamAggregatedHourlyMetric {
  team_id: string;
  hour_bucket: string;
  active_members_count: number;
  avg_perclos: number;
  avg_posture_score: number;
  avg_sitting_min: number;
  total_events: number;
  is_anonymity_satisfied: boolean;
}
