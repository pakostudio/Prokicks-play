// ProKicks Vision — contratos TypeScript compartidos por UI, API routes y motor externo.
// Este archivo es nuevo y no modifica lib/types.ts existente.

export type VisionSessionStatus =
  | 'draft'
  | 'calibrating'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type VisionSession = {
  id: string;
  coach_id: string;
  status: VisionSessionStatus;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  block_number: number;
  camera_1_label: string | null;
  camera_2_label: string | null;
  created_at: string;
};

export type VisionSessionPlayer = {
  id: string;
  session_id: string;
  player_id: string;
  position_number: 1 | 2 | 3 | 4;
  tracking_id: string | null;
  calibration_confidence: number | null;
  created_at: string;
  display_name?: string | null;
  alias?: string | null;
};

export type VisionCalibration = {
  id: string;
  session_id: string;
  camera_id: string;
  player_id: string | null;
  tracking_id: string | null;
  bounding_box: BoundingBox | null;
  created_at: string;
};

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type VisionEventType =
  | 'contact'
  | 'pass'
  | 'reaction'
  | 'movement_start'
  | 'movement_end'
  | 'session_marker';

export type VisionEvent = {
  id: string;
  session_id: string;
  player_id: string | null;
  event_type: VisionEventType | string;
  timestamp_ms: number;
  confidence: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export const VISION_METRIC_KEYS = [
  'contactos_estimados',
  'participacion',
  'tiempo_entre_eventos',
  'tiempo_reaccion',
  'posicion_x',
  'posicion_y',
  'trayectoria',
  'desplazamiento',
  'distancia_recorrida',
  'velocidad_aproximada',
  'tiempo_activo',
  'consistencia',
  'confianza_modelo'
] as const;

export type VisionMetricKey = (typeof VISION_METRIC_KEYS)[number];

export const VISION_METRIC_LABELS: Record<VisionMetricKey, string> = {
  contactos_estimados: 'Contactos estimados',
  participacion: 'Participación',
  tiempo_entre_eventos: 'Tiempo entre eventos',
  tiempo_reaccion: 'Tiempo de reacción',
  posicion_x: 'Posición X',
  posicion_y: 'Posición Y',
  trayectoria: 'Trayectoria',
  desplazamiento: 'Desplazamiento',
  distancia_recorrida: 'Distancia recorrida',
  velocidad_aproximada: 'Velocidad aproximada',
  tiempo_activo: 'Tiempo activo',
  consistencia: 'Consistencia',
  confianza_modelo: 'Confianza del modelo'
};

export type VisionMetric = {
  id: string;
  session_id: string;
  player_id: string;
  metric_key: VisionMetricKey | string;
  metric_value: number | null;
  metric_unit: string | null;
  confidence: number | null;
  created_at: string;
};

export type SensorEvent = {
  id: string;
  session_id: string | null;
  sensor_id: string;
  timestamp_ms: number;
  impact_detected: boolean;
  relative_intensity: number | null;
  axis_x: number | null;
  axis_y: number | null;
  axis_z: number | null;
  created_at: string;
};

export type CreateVisionSessionPayload = {
  coach_id: string;
  camera_1_label?: string;
  camera_2_label?: string;
  players: Array<{ player_id: string; position_number: 1 | 2 | 3 | 4; tracking_id?: string }>;
};

export type IngestVisionEventPayload = {
  session_id: string;
  events: Array<{
    player_id?: string | null;
    tracking_id?: string;
    event_type: VisionEventType | string;
    timestamp_ms: number;
    confidence?: number;
    metadata?: Record<string, unknown>;
  }>;
};

export type IngestVisionMetricsPayload = {
  session_id: string;
  metrics: Array<{
    player_id: string;
    metric_key: VisionMetricKey | string;
    metric_value: number | null;
    metric_unit?: string;
    confidence?: number;
  }>;
};

export type CompleteVisionSessionPayload = {
  session_id: string;
  ended_at: string;
  duration_seconds: number;
  reason: 'timer_20min' | 'coach_manual' | 'camera_lost' | 'error';
};

export const VISION_ENGINE_PIPELINE = [
  'camaras',
  'detector_objetos',
  'bytetrack',
  'supervision_opencv',
  'motor_eventos_metricas',
  'api_local',
  'supabase',
  'prokicks_play'
] as const;
