'use client';

import { trackEvent } from '@/lib/analytics';

// Nombres exactos requeridos por Observability. No renombrar.
export const VISION_OBSERVABILITY_EVENTS = {
  sessionCreated: 'vision_session_created',
  camerasConnected: 'cameras_connected',
  calibrationCompleted: 'calibration_completed',
  sessionStarted: 'vision_session_started',
  sessionPaused: 'vision_session_paused',
  sessionCompleted: 'vision_session_completed',
  metricsViewed: 'vision_metrics_viewed',
  cameraConnectionFailed: 'camera_connection_failed',
  calibrationFailed: 'calibration_failed'
} as const;

export type VisionObservabilityEvent =
  (typeof VISION_OBSERVABILITY_EVENTS)[keyof typeof VISION_OBSERVABILITY_EVENTS];

type VisionEventProps = Record<string, string | number | boolean | null | undefined>;

export function trackVisionEvent(event: VisionObservabilityEvent, props: VisionEventProps = {}) {
  trackEvent(event, { module: 'vision', ...props });
}
