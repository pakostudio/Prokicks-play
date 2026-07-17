// Cliente de referencia para hablar con el ProKicks Vision Engine a través
// de las API routes locales de este mismo proyecto (app/api/vision/*).
// Este archivo NO ejecuta detección ni tracking: solo hace fetch() a los
// endpoints locales y expone utilidades de cámara del navegador.
import type {
  CreateVisionSessionPayload,
  IngestVisionEventPayload,
  IngestVisionMetricsPayload,
  CompleteVisionSessionPayload
} from '@/lib/vision/types';

type EngineResult<T = unknown> = { ok: boolean; data?: T; error?: string };

async function postJson<T>(url: string, body: unknown): Promise<EngineResult<T>> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => undefined);
    if (!res.ok) {
      return { ok: false, error: data?.error || `Error ${res.status}` };
    }
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Error de red' };
  }
}

export const visionEngineClient = {
  createSession: (payload: CreateVisionSessionPayload) =>
    postJson('/api/vision/sessions', payload),
  sendEvents: (payload: IngestVisionEventPayload) =>
    postJson('/api/vision/events', payload),
  sendMetrics: (payload: IngestVisionMetricsPayload) =>
    postJson('/api/vision/metrics', payload),
  completeSession: (payload: CompleteVisionSessionPayload) =>
    postJson('/api/vision/complete', payload)
};

export type CameraDevice = {
  deviceId: string;
  label: string;
};

// Pide permiso de cámara primero: sin esto, enumerateDevices() no expone
// las etiquetas (label) reales de cada cámara en la mayoría de navegadores.
export async function listVideoInputDevices(): Promise<CameraDevice[]> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) return [];
  try {
    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
    tempStream.getTracks().forEach((t) => t.stop());
  } catch {
    // Si el usuario niega permisos, igual intentamos enumerar (labels vacíos).
  }
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter((d) => d.kind === 'videoinput')
    .map((d) => ({ deviceId: d.deviceId, label: d.label || 'Cámara' }));
}

export async function openCameraStream(deviceId: string): Promise<MediaStream | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) return null;
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: deviceId ? { deviceId: { exact: deviceId } } : true
    });
  } catch {
    return null;
  }
}
