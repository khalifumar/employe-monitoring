import {
  FilesetResolver,
  FaceLandmarker,
  PoseLandmarker,
} from '@mediapipe/tasks-vision';
import {
  extractVisionFeatures,
  type ExtractedVisionMetrics,
  type RawLandmarkPoint,
} from './feature-extractor';
import type { PersonalBaseline } from '@selaras/shared';

export interface VisionPipelineOptions {
  wasmPath?: string;
  faceModelPath?: string;
  poseModelPath?: string;
  baseline?: PersonalBaseline;
  onFrameMetrics: (metrics: ExtractedVisionMetrics) => void;
  onError?: (error: Error) => void;
}

export class VisionPipeline {
  private faceLandmarker: FaceLandmarker | null = null;
  private poseLandmarker: PoseLandmarker | null = null;
  private isRunning = false;
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private animationFrameId: number | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private lastProcessedTime = 0;
  private currentFps = 2; // Adaptive 2–5 fps
  private baseline?: PersonalBaseline;
  private onMetrics: (metrics: ExtractedVisionMetrics) => void;
  private onError?: (error: Error) => void;

  constructor(options: VisionPipelineOptions) {
    this.baseline = options.baseline;
    this.onMetrics = options.onFrameMetrics;
    this.onError = options.onError;
  }

  public updateBaseline(baseline: PersonalBaseline): void {
    this.baseline = baseline;
  }

  /**
   * Initializes MediaPipe Task Vision models using 100% locally bundled WASM & task files.
   */
  public async initialize(
    wasmPath = '/wasm',
    faceModelPath = '/models/face_landmarker.task',
    poseModelPath = '/models/pose_landmarker.task'
  ): Promise<void> {
    try {
      const vision = await FilesetResolver.forVisionTasks(wasmPath);

      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: faceModelPath,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });

      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: poseModelPath,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.onError?.(error);
      throw error;
    }
  }

  /**
   * Starts processing on-device video stream.
   */
  public async start(mediaStream: MediaStream): Promise<void> {
    if (this.isRunning) return;
    this.stream = mediaStream;

    // Create offscreen video element
    if (typeof document !== 'undefined') {
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = mediaStream;
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      this.videoElement.muted = true;
      await this.videoElement.play();
    }

    this.isRunning = true;
    this.scheduleNextFrame();
  }

  /**
   * Stops processing and releases camera stream immediately.
   */
  public stop(): void {
    this.isRunning = false;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  /**
   * Adaptive loop: 2 fps during steady periods (500ms delay), up to 5 fps (200ms delay)
   * when posture shifts or blinks occur.
   */
  private scheduleNextFrame(): void {
    if (!this.isRunning) return;

    const delayMs = Math.round(1000 / this.currentFps);
    this.timeoutId = setTimeout(() => {
      this.processFrame();
    }, delayMs);
  }

  private processFrame(): void {
    if (!this.isRunning || !this.videoElement || this.videoElement.readyState < 2) {
      this.scheduleNextFrame();
      return;
    }

    const now = performance.now();
    // Enforce strictly increasing timestamps required by MediaPipe VIDEO mode
    const timestampMs = Math.max(now, this.lastProcessedTime + 1);
    this.lastProcessedTime = timestampMs;

    try {
      let faceLandmarks: RawLandmarkPoint[][] | null = null;
      let poseLandmarks: RawLandmarkPoint[][] | null = null;

      if (this.faceLandmarker) {
        const faceResult = this.faceLandmarker.detectForVideo(this.videoElement, timestampMs);
        if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
          faceLandmarks = faceResult.faceLandmarks as RawLandmarkPoint[][];
        }
      }

      if (this.poseLandmarker) {
        const poseResult = this.poseLandmarker.detectForVideo(this.videoElement, timestampMs);
        if (poseResult.landmarks && poseResult.landmarks.length > 0) {
          poseLandmarks = poseResult.landmarks as RawLandmarkPoint[][];
        }
      }

      // Compute scalar metrics
      const metrics = extractVisionFeatures(faceLandmarks, poseLandmarks, this.baseline);

      // Invariant: Clear landmarks from local references immediately
      faceLandmarks = null;
      poseLandmarks = null;

      // Adjust adaptive FPS:
      // If blinking, yawning, or posture score is degrading (< 70), sample at 5 fps to capture dynamic event.
      // Otherwise remain at steady 2 fps to minimize CPU load.
      if (metrics.isBlink || metrics.isYawn || metrics.postureScore < 70) {
        this.currentFps = 5;
      } else {
        this.currentFps = 2;
      }

      // Emit strictly scalar metrics
      this.onMetrics(metrics);
    } catch (err) {
      console.warn('[Selaras Vision] Frame inference warning:', err);
    }

    this.scheduleNextFrame();
  }
}
