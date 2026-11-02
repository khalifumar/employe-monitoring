/**
 * Default scientific and privacy thresholds for Selaras
 */

// --- Drowsiness & Fatigue (Scientific Literature Baselines) ---
export const EAR_DEFAULT_THRESHOLD = 0.21;
export const PERCLOS_WINDOW_SECONDS = 60;
export const PERCLOS_WARN_THRESHOLD = 0.15; // 15% eye closure indicates early fatigue
export const PERCLOS_SEVERE_THRESHOLD = 0.25; // 25% indicates severe drowsiness
export const MAR_DEFAULT_YAWN_THRESHOLD = 0.6;
export const YAWN_MIN_DURATION_SECONDS = 2.0;

// --- Posture & Ergonomics ---
export const HEAD_FORWARD_WARN_DEGREES = 25.0; // degrees deviation from vertical
export const SHOULDER_TILT_WARN_DEGREES = 8.0; // degrees deviation from horizontal
export const POSTURE_SCORE_BASE = 100;

// --- Privacy & Anonymity Invariants ---
export const K_ANONYMITY_MIN_MEMBERS = 5; // Minimum active team members required for manager aggregated view
export const TELEMETRY_RETENTION_DAYS = 90; // Auto-purge period in Supabase via pg_cron

// --- Performance Budgets ---
export const VISION_ADAPTIVE_FPS_MIN = 2;
export const VISION_ADAPTIVE_FPS_MAX = 5;
export const CPU_BUDGET_PERCENT_MAX = 5;
