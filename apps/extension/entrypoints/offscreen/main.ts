import { VisionPipeline } from '../../src/lib/vision/vision-pipeline';
import { getPersonalBaseline } from '../../src/lib/storage';

let pipeline: VisionPipeline | null = null;
let currentMediaStream: MediaStream | null = null;

async function startStream(): Promise<void> {
  if (pipeline) {
    return;
  }

  const baseline = await getPersonalBaseline();

  pipeline = new VisionPipeline({
    baseline: baseline || undefined,
    wasmPath: chrome.runtime.getURL('wasm'),
    faceModelPath: chrome.runtime.getURL('models/face_landmarker.task'),
    poseModelPath: chrome.runtime.getURL('models/pose_landmarker.task'),
    onFrameMetrics: (metrics) => {
      // Dispatch only scalar numbers to Service Worker
      chrome.runtime.sendMessage({
        type: 'VISION_FRAME_METRICS',
        metrics,
      }).catch(() => {
        // Ignored if service worker is briefly asleep
      });
    },
    onError: (err) => {
      console.warn('[Selaras Offscreen] Vision pipeline error:', err);
    },
  });

  try {
    await pipeline.initialize(
      chrome.runtime.getURL('wasm'),
      chrome.runtime.getURL('models/face_landmarker.task'),
      chrome.runtime.getURL('models/pose_landmarker.task')
    );

    currentMediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 320 },
        height: { ideal: 240 },
        frameRate: { ideal: 5, max: 10 },
      },
      audio: false,
    });

    await pipeline.start(currentMediaStream);
    console.log('[Selaras Offscreen] Vision stream successfully started at 320x240.');
  } catch (err) {
    console.error('[Selaras Offscreen] Failed to start camera stream:', err);
    stopStream();
  }
}

function stopStream(): void {
  if (pipeline) {
    pipeline.stop();
    pipeline = null;
  }
  if (currentMediaStream) {
    currentMediaStream.getTracks().forEach((t) => t.stop());
    currentMediaStream = null;
  }
  console.log('[Selaras Offscreen] Vision stream stopped.');
}

// Runtime message listener for Offscreen control
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'START_OFFSCREEN_VISION') {
    startStream().then(() => sendResponse({ status: 'started' }));
    return true;
  } else if (msg.type === 'STOP_OFFSCREEN_VISION') {
    stopStream();
    sendResponse({ status: 'stopped' });
    return false;
  } else if (msg.type === 'UPDATE_OFFSCREEN_BASELINE') {
    if (pipeline && msg.baseline) {
      pipeline.updateBaseline(msg.baseline);
    }
    sendResponse({ status: 'ok' });
    return false;
  }
  return false;
});

// Announce offscreen ready state
chrome.runtime.sendMessage({ type: 'OFFSCREEN_LOADED' }).catch(() => {});
