import type { Point2D } from "../types";
import { euclideanDistance } from "./ear";

/**
 * Calculates head-forward angle (degrees) relative to vertical axis.
 * In 2D plane (side or 3/4 view, or ear-shoulder offset in front view):
 * Uses horizontal displacement of ear relative to shoulder.
 *
 * @param ear Ear landmark point (left or right ear depending on user orientation)
 * @param shoulder Corresponding shoulder landmark point
 * @returns Angle in degrees from vertical [0, 90]
 */
export function calculateHeadForwardAngle(
  ear: Point2D,
  shoulder: Point2D,
): number {
  const dx = Math.abs(ear.x - shoulder.x);
  // In screen coords, shoulder is below ear (shoulder.y > ear.y)
  const dy = Math.max(1e-4, Math.abs(shoulder.y - ear.y));
  const radians = Math.atan2(dx, dy);
  return (radians * 180.0) / Math.PI;
}

/**
 * Calculates shoulder tilt angle (degrees) relative to horizontal line.
 *
 * @param leftShoulder Left shoulder point
 * @param rightShoulder Right shoulder point
 * @returns Tilt angle in degrees [0, 90]
 */
export function calculateShoulderTilt(
  leftShoulder: Point2D,
  rightShoulder: Point2D,
): number {
  const dy = Math.abs(leftShoulder.y - rightShoulder.y);
  const dx = Math.max(1e-4, Math.abs(leftShoulder.x - rightShoulder.x));
  const radians = Math.atan2(dy, dx);
  return (radians * 180.0) / Math.PI;
}

/**
 * Calculates screen distance proxy using inter-ocular distance.
 * When the user sits closer to the webcam, the distance between left and right eye increases.
 *
 * @param leftEye Left eye point (pupil or eye center)
 * @param rightEye Right eye point
 * @returns Euclidean pixel/normalized distance
 */
export function calculateScreenDistanceProxy(
  leftEye: Point2D,
  rightEye: Point2D,
): number {
  return euclideanDistance(leftEye, rightEye);
}

/**
 * Menghitung Vertical Slouch Ratio (Vertical Neck / Shoulder Width)
 * Mengadopsi arsitektur PostureGuardAI (Khalif Umar Al Faruq).
 *
 * - Posisi Tegak: Ratio Tinggi (> 0.38 - 0.5)
 * - Posisi Bungkuk (Slouching/Kepala Tenggelam): Ratio Rendah (< 0.38)
 *
 * @param headMid Titik tengah kepala/telinga atau mulut
 * @param leftShoulder Titik bahu kiri
 * @param rightShoulder Titik bahu kanan
 * @returns Compression ratio
 */
export function calculateSlouchRatio(
  headMid: Point2D,
  leftShoulder: Point2D,
  rightShoulder: Point2D,
): number {
  const shoulderWidth = euclideanDistance(leftShoulder, rightShoulder);
  if (shoulderWidth <= 1e-4) return 0;
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
  const neckVerticalHeight = Math.abs(shoulderMidY - headMid.y);
  return neckVerticalHeight / shoulderWidth;
}

/**
 * Menghitung kemiringan leher (Neck Angle) dengan koreksi aspect ratio.
 * Mengadopsi arsitektur PostureGuardAI.
 *
 * @param ear Titik telinga (earMid atau ear lateral)
 * @param shoulder Titik bahu (shoulderMid atau shoulder lateral)
 * @param aspectRatio Rasio aspek video (default 640 / 480)
 * @returns Sudut deviasi tegak [0, 90]
 */
export function calculateNeckAngle(
  ear: Point2D,
  shoulder: Point2D,
  aspectRatio: number = 640 / 480,
): number {
  const dy = shoulder.y - ear.y;
  const dx = (shoulder.x - ear.x) * aspectRatio;
  const radians = Math.atan2(dy, dx);
  const degrees = Math.abs((radians * 180.0) / Math.PI);
  return Math.abs(90 - degrees);
}
