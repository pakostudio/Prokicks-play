'use client';

import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

export type Keypoint = { x: number; y: number; score: number; name?: string };

let detectorPromise: Promise<poseDetection.PoseDetector> | null = null;

export function getPoseDetector() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      await tf.setBackend('webgl');
      await tf.ready();
      return poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      });
    })();
  }
  return detectorPromise;
}

export async function detectPose(
  detector: poseDetection.PoseDetector,
  video: HTMLVideoElement
): Promise<Keypoint[] | null> {
  const poses = await detector.estimatePoses(video, { flipHorizontal: false });
  if (!poses.length) return null;
  return poses[0].keypoints as Keypoint[];
}

export function kp(keypoints: Keypoint[], name: string): Keypoint | null {
  const found = keypoints.find((k) => k.name === name);
  return found && found.score > 0.35 ? found : null;
}

export function midpoint(a: Keypoint, b: Keypoint) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export const SKELETON_PAIRS: [string, string][] = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
];
