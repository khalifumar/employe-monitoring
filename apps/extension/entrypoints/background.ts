import {
  addInputEvents,
  addVisionSample,
  setMinuteIdleSeconds,
  finalizeAndFlushMinute,
} from '../src/lib/aggregator';
import {
  getNudgeSettings,
  isMonitoringPaused,
  isMeetingMode,
  isCameraPermissionGranted,
} from '../src/lib/storage';
import { syncPendingQueue } from '../src/lib/sync';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  DEFAULT_TEAM_ID,
} from '../src/lib/config';

export default defineBackground(() => {
  const ALARM_MINUTE = 'selaras_minute_aggregator';
  const ALARM_RETRY_SYNC = 'selaras_retry_sync';
  const ALARM_NUDGES = 'selaras_nudges_checker';
  const ALARM_SESSION = 'selaras_check_team_session';

  let currentIdleSecInMinute = 0;
  let isCurrentlyIdle = false;
  let isTeamSessionActive = false;

  // 1. Initialize Alarms
  chrome.alarms.create(ALARM_MINUTE, { periodInMinutes: 1 });
  chrome.alarms.create(ALARM_RETRY_SYNC, { periodInMinutes: 1 });
  chrome.alarms.create(ALARM_NUDGES, { periodInMinutes: 5 });
  chrome.alarms.create(ALARM_SESSION, { periodInMinutes: 0.5 }); // Check team session every 30s

  // 2. Idle Detection (Threshold: 60s)
  chrome.idle.setDetectionInterval(60);

  chrome.idle.onStateChanged.addListener((newState) => {
    if (newState === 'idle' || newState === 'locked') {
      isCurrentlyIdle = true;
      currentIdleSecInMinute = 60;
    } else {
      isCurrentlyIdle = false;
      currentIdleSecInMinute = 0;
    }
    setMinuteIdleSeconds(currentIdleSecInMinute);
  });

  // 3. Alarm Dispatcher
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_MINUTE) {
      if (isCurrentlyIdle) {
        setMinuteIdleSeconds(60);
      }
      await finalizeAndFlushMinute();
      currentIdleSecInMinute = 0;
    } else if (alarm.name === ALARM_RETRY_SYNC) {
      await syncPendingQueue();
    } else if (alarm.name === ALARM_NUDGES) {
      await checkAndDispatchNudges();
    } else if (alarm.name === ALARM_SESSION) {
      await checkTeamSessionStatus();
    }
  });

  // 4. Runtime Message Hub
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'INPUT_COUNTS_REPORT') {
      addInputEvents(Number(msg.count) || 0);
      sendResponse({ status: 'ok' });
      return false;
    } else if (msg.type === 'FORCE_FLUSH_MINUTE') {
      finalizeAndFlushMinute().then((payload) => {
        sendResponse({ status: 'ok', payload });
      });
      return true; // Keep channel open for async response
    } else if (msg.type === 'TRIGGER_SYNC') {
      syncPendingQueue().then((res) => {
        sendResponse({ status: 'ok', res });
      });
      return true;
    } else if (msg.type === 'VISION_FRAME_METRICS' && msg.metrics) {
      addVisionSample({
        ear: msg.metrics.ear,
        headAngle: msg.metrics.headForwardAngle,
        shoulderTilt: msg.metrics.shoulderTilt,
        postureScore: msg.metrics.postureScore,
        isFacePresent: msg.metrics.facePresent,
        isBlink: msg.metrics.isBlink,
        isYawn: msg.metrics.isYawn,
      });
      sendResponse({ status: 'ok' });
      return false;
    } else if (msg.type === 'START_VISION_CAPTURE') {
      ensureOffscreenDocument().then(() => {
        setTimeout(() => {
          chrome.runtime.sendMessage({ type: 'START_OFFSCREEN_VISION' }).catch(() => {});
        }, 300);
      });
      sendResponse({ status: 'ok' });
      return false;
    } else if (msg.type === 'STOP_VISION_CAPTURE') {
      chrome.runtime.sendMessage({ type: 'STOP_OFFSCREEN_VISION' }).catch(() => {});
      closeOffscreenDocument();
      sendResponse({ status: 'ok' });
      return false;
    }
    return false;
  });

  // Offscreen Document Lifecycle Managers
  async function hasOffscreenDocument(): Promise<boolean> {
    if ('offscreen' in chrome && chrome.offscreen && chrome.offscreen.hasDocument) {
      return await chrome.offscreen.hasDocument();
    }
    return false;
  }

  async function ensureOffscreenDocument(): Promise<void> {
    if (!('offscreen' in chrome) || !chrome.offscreen) return;
    const exists = await hasOffscreenDocument();
    if (exists) return;

    try {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['USER_MEDIA' as chrome.offscreen.Reason],
        justification: 'Pemrosesan on-device lokal visi komputer tanpa mengirim rekaman video ke jaringan.',
      });
    } catch (err) {
      console.warn('[Selaras Background] createDocument warning:', err);
    }
  }

  async function closeOffscreenDocument(): Promise<void> {
    if (!('offscreen' in chrome) || !chrome.offscreen) return;
    const exists = await hasOffscreenDocument();
    if (!exists) return;

    try {
      await chrome.offscreen.closeDocument();
    } catch (err) {
      console.warn('[Selaras Background] closeDocument warning:', err);
    }
  }

  // 5. Active Team Session Poller (Manager Start/Stop Synchronizer)
  async function checkTeamSessionStatus() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/team_sessions?team_id=eq.${DEFAULT_TEAM_ID}&status=eq.active&select=*&order=started_at.desc&limit=1`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      const hasActiveSession = Array.isArray(data) && data.length > 0;

      if (hasActiveSession && !isTeamSessionActive) {
        isTeamSessionActive = true;
        await ensureOffscreenDocument();
        setTimeout(() => {
          chrome.runtime.sendMessage({ type: 'START_OFFSCREEN_VISION' }).catch(() => {});
        }, 500);

        try {
          chrome.notifications.create('selaras_session_started', {
            type: 'basic',
            iconUrl: '/icons/icon-128.png',
            title: 'Selaras — Sesi Kerja Tim Dimulai!',
            message: 'Manajer telah memulai sesi kerja bersama. Selaras aktif memantau ergonomi & ritme fokus Anda.',
            priority: 2,
          });
        } catch {
          // ignore notification permission issues
        }
      } else if (!hasActiveSession && isTeamSessionActive) {
        isTeamSessionActive = false;
        chrome.runtime.sendMessage({ type: 'STOP_OFFSCREEN_VISION' }).catch(() => {});
        await closeOffscreenDocument();

        try {
          chrome.notifications.create('selaras_session_ended', {
            type: 'basic',
            iconUrl: '/icons/icon-128.png',
            title: 'Selaras — Sesi Kerja Tim Selesai',
            message: 'Sesi kerja tim telah diakhiri. Pemantauan kamera otomatis dihentikan.',
            priority: 1,
          });
        } catch {
          // ignore notification permission issues
        }
      }
    } catch (err) {
      console.warn('[Selaras Background] Session poll error:', err);
    }
  }

  // Initial check on load
  checkTeamSessionStatus();

  // Auto-initiate offscreen vision if permission is already granted and not paused
  isCameraPermissionGranted().then(async (granted) => {
    const paused = await isMonitoringPaused();
    if (granted && !paused) {
      await ensureOffscreenDocument();
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'START_OFFSCREEN_VISION' }).catch(() => {});
      }, 500);
    }
  });

  // 6. Nudges Dispatcher
  async function checkAndDispatchNudges() {
    const paused = await isMonitoringPaused();
    if (paused) return;

    const inMeeting = await isMeetingMode();
    if (inMeeting) return;

    const nudges = await getNudgeSettings();

    const now = new Date();
    const currentHour = now.getHours();
    const [startH = 18] = nudges.quietHoursStart.split(':').map(Number);
    const [endH = 8] = nudges.quietHoursEnd.split(':').map(Number);

    const isQuietHour =
      startH > endH
        ? currentHour >= startH || currentHour < endH
        : currentHour >= startH && currentHour < endH;

    if (isQuietHour) return;

    if (nudges.eyeRestEnabled) {
      try {
        chrome.notifications.create('selaras_eye_rest_nudge', {
          type: 'basic',
          iconUrl: '/icons/icon-128.png',
          title: 'Selaras — Waktunya Istirahat Mata',
          message: 'Alihkan pandangan Anda ke objek sejauh 6 meter selama 20 detik untuk mencegah ketegangan mata.',
          priority: 1,
        });
      } catch {
        // ignore
      }
    }
  }
});
