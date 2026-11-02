import type {
  ConsentSettings,
  PersonalBaseline,
  TelemetryPayload,
} from '@selaras/shared';

export interface ActiveTaskState {
  id: string;
  title: string;
  estimatedMin: number | null;
  startedAt: string;
}

export interface NudgeSettings {
  eyeRestEnabled: boolean;
  stretchEnabled: boolean;
  stretchIntervalMin: number;
  quietHoursStart: string; // '18:00'
  quietHoursEnd: string;   // '08:00'
}

export const DEFAULT_CONSENTS: ConsentSettings = {
  drowsiness_detection: true,
  posture_detection: true,
  activity_tracking: true,
  task_timer: true,
  tab_category_opt_in: false, // OFF by default
  manager_individual_view_opt_in: false, // OFF by default
  last_updated: new Date().toISOString(),
};

export const DEFAULT_NUDGES: NudgeSettings = {
  eyeRestEnabled: true,
  stretchEnabled: true,
  stretchIntervalMin: 60,
  quietHoursStart: '18:00',
  quietHoursEnd: '08:00',
};

/**
 * Helper to generate or retrieve stable local user pseudonym.
 * Ensures the extension works offline or before cloud authentication.
 */
export async function getOrCreateUserPseudoId(): Promise<string> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return 'local-dev-user-001';
  }
  const result = await chrome.storage.local.get('user_pseudo_id');
  if (result.user_pseudo_id) {
    return result.user_pseudo_id;
  }
  const newId = 'usr_' + crypto.randomUUID();
  await chrome.storage.local.set({ user_pseudo_id: newId });
  return newId;
}

export async function getConsentSettings(): Promise<ConsentSettings> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return DEFAULT_CONSENTS;
  }
  const result = await chrome.storage.local.get('consent_settings');
  return result.consent_settings || DEFAULT_CONSENTS;
}

export async function setConsentSettings(settings: ConsentSettings): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) return;
  await chrome.storage.local.set({ consent_settings: settings });
}

export async function isMonitoringPaused(): Promise<boolean> {
  if (typeof chrome === 'undefined' || !chrome.storage) return false;
  const result = await chrome.storage.local.get('is_paused');
  return !!result.is_paused;
}

export async function setMonitoringPaused(paused: boolean): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) return;
  await chrome.storage.local.set({ is_paused: paused });
}

export async function isMeetingMode(): Promise<boolean> {
  if (typeof chrome === 'undefined' || !chrome.storage) return false;
  const result = await chrome.storage.local.get('meeting_mode');
  return !!result.meeting_mode;
}

export async function setMeetingMode(active: boolean): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) return;
  await chrome.storage.local.set({ meeting_mode: active });
}

export async function getActiveTask(): Promise<ActiveTaskState | null> {
  if (typeof chrome === 'undefined' || !chrome.storage) return null;
  const result = await chrome.storage.local.get('active_task');
  return result.active_task || null;
}

export async function setActiveTask(task: ActiveTaskState | null): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) return;
  await chrome.storage.local.set({ active_task: task });
}

export async function getNudgeSettings(): Promise<NudgeSettings> {
  if (typeof chrome === 'undefined' || !chrome.storage) return DEFAULT_NUDGES;
  const result = await chrome.storage.local.get('nudge_settings');
  return result.nudge_settings || DEFAULT_NUDGES;
}

export async function setNudgeSettings(settings: NudgeSettings): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) return;
  await chrome.storage.local.set({ nudge_settings: settings });
}

/**
 * Stores the exact payload that was dispatched over the network.
 * This guarantees the "What is sent" screen displays the exact transmitted JSON.
 */
export async function recordDispatchedPayload(payload: TelemetryPayload): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) return;
  const result = await chrome.storage.local.get('recent_payloads');
  const recents: TelemetryPayload[] = result.recent_payloads || [];
  recents.unshift(payload);
  // Keep last 10 payloads
  if (recents.length > 10) {
    recents.length = 10;
  }
  await chrome.storage.local.set({
    last_synced_payload: payload,
    recent_payloads: recents,
  });
}

export async function getLastSyncedPayload(): Promise<TelemetryPayload | null> {
  if (typeof chrome === 'undefined' || !chrome.storage) return null;
  const result = await chrome.storage.local.get('last_synced_payload');
  return result.last_synced_payload || null;
}

export async function getRecentPayloads(): Promise<TelemetryPayload[]> {
  if (typeof chrome === 'undefined' || !chrome.storage) return [];
  const result = await chrome.storage.local.get('recent_payloads');
  return result.recent_payloads || [];
}

export async function getPersonalBaseline(): Promise<PersonalBaseline | null> {
  if (typeof chrome === 'undefined' || !chrome.storage) return null;
  const result = await chrome.storage.local.get('personal_baseline');
  return result.personal_baseline || null;
}

export async function setPersonalBaseline(baseline: PersonalBaseline): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) return;
  await chrome.storage.local.set({ personal_baseline: baseline });
}

export async function isCameraPermissionGranted(): Promise<boolean> {
  if (typeof chrome === 'undefined' || !chrome.storage) return false;
  const result = await chrome.storage.local.get('camera_permission_granted');
  return !!result.camera_permission_granted;
}

export async function setCameraPermissionGranted(granted: boolean): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) return;
  await chrome.storage.local.set({ camera_permission_granted: granted });
}
