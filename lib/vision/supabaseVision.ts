// ProKicks Vision — acceso a datos en Supabase.
// Usa el mismo cliente supabase (anon key) que el resto de la app.
// Nunca usa service_role en el navegador.

import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/monitoring';
import type {
  VisionSession,
  VisionSessionPlayer,
  VisionMetric,
  VisionEvent,
  VisionCalibration,
  VisionMetricKey
} from './types';

export async function createVisionSession(params: {
  coachId: string;
  camera1Label?: string;
  camera2Label?: string;
}): Promise<VisionSession | null> {
  const { data, error } = await supabase
    .from('vision_sessions')
    .insert({
      coach_id: params.coachId,
      status: 'draft',
      camera_1_label: params.camera1Label || null,
      camera_2_label: params.camera2Label || null
    })
    .select()
    .single();

  if (error) {
    captureError(error, { area: 'vision', action: 'createVisionSession' });
    return null;
  }
  return data as VisionSession;
}

export async function assignSessionPlayers(
  sessionId: string,
  players: Array<{ playerId: string; positionNumber: 1 | 2 | 3 | 4 }>
): Promise<VisionSessionPlayer[]> {
  const rows = players.map((p) => ({
    session_id: sessionId,
    player_id: p.playerId,
    position_number: p.positionNumber
  }));

  const { data, error } = await supabase
    .from('vision_session_players')
    .upsert(rows, { onConflict: 'session_id,position_number' })
    .select();

  if (error) {
    captureError(error, { area: 'vision', action: 'assignSessionPlayers' });
    return [];
  }
  return (data || []) as VisionSessionPlayer[];
}

export async function saveCalibration(row: {
  sessionId: string;
  cameraId: string;
  playerId: string;
  trackingId: string;
  boundingBox: { x: number; y: number; width: number; height: number };
}): Promise<VisionCalibration | null> {
  const { data, error } = await supabase
    .from('vision_calibrations')
    .insert({
      session_id: row.sessionId,
      camera_id: row.cameraId,
      player_id: row.playerId,
      tracking_id: row.trackingId,
      bounding_box: row.boundingBox
    })
    .select()
    .single();

  if (error) {
    captureError(error, { area: 'vision', action: 'saveCalibration' });
    return null;
  }

  await supabase
    .from('vision_session_players')
    .update({ tracking_id: row.trackingId, calibration_confidence: 1 })
    .eq('session_id', row.sessionId)
    .eq('player_id', row.playerId);

  return data as VisionCalibration;
}

export async function startVisionSession(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('vision_sessions')
    .update({ status: 'active', started_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) {
    captureError(error, { area: 'vision', action: 'startVisionSession' });
    return false;
  }
  return true;
}

export async function pauseVisionSession(sessionId: string, paused: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('vision_sessions')
    .update({ status: paused ? 'paused' : 'active' })
    .eq('id', sessionId);

  if (error) {
    captureError(error, { area: 'vision', action: 'pauseVisionSession' });
    return false;
  }
  return true;
}

export async function completeVisionSession(
  sessionId: string,
  durationSeconds: number
): Promise<boolean> {
  const { error } = await supabase
    .from('vision_sessions')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString(),
      duration_seconds: durationSeconds
    })
    .eq('id', sessionId);

  if (error) {
    captureError(error, { area: 'vision', action: 'completeVisionSession' });
    return false;
  }
  return true;
}

export async function startNextBlock(previousSessionId: string): Promise<VisionSession | null> {
  const { data: prev, error: prevError } = await supabase
    .from('vision_sessions')
    .select('coach_id, block_number, camera_1_label, camera_2_label')
    .eq('id', previousSessionId)
    .single();

  if (prevError || !prev) {
    captureError(prevError, { area: 'vision', action: 'startNextBlock:lookup' });
    return null;
  }

  const { data, error } = await supabase
    .from('vision_sessions')
    .insert({
      coach_id: prev.coach_id,
      status: 'draft',
      block_number: (prev.block_number || 1) + 1,
      camera_1_label: prev.camera_1_label,
      camera_2_label: prev.camera_2_label
    })
    .select()
    .single();

  if (error) {
    captureError(error, { area: 'vision', action: 'startNextBlock:insert' });
    return null;
  }

  const { data: prevPlayers } = await supabase
    .from('vision_session_players')
    .select('player_id, position_number, tracking_id, calibration_confidence')
    .eq('session_id', previousSessionId);

  if (prevPlayers?.length) {
    await supabase.from('vision_session_players').insert(
      prevPlayers.map((p) => ({
        session_id: data.id,
        player_id: p.player_id,
        position_number: p.position_number,
        tracking_id: p.tracking_id,
        calibration_confidence: p.calibration_confidence
      }))
    );
  }

  return data as VisionSession;
}

export async function getSession(sessionId: string): Promise<VisionSession | null> {
  const { data, error } = await supabase.from('vision_sessions').select('*').eq('id', sessionId).single();
  if (error) {
    captureError(error, { area: 'vision', action: 'getSession' });
    return null;
  }
  return data as VisionSession;
}

export async function getSessionPlayers(sessionId: string): Promise<VisionSessionPlayer[]> {
  const { data, error } = await supabase
    .from('vision_session_players')
    .select('*, prokicks_profiles(display_name, alias)')
    .eq('session_id', sessionId)
    .order('position_number', { ascending: true });

  if (error) {
    captureError(error, { area: 'vision', action: 'getSessionPlayers' });
    return [];
  }

  return (data || []).map((row: any) => ({
    ...row,
    display_name: row.prokicks_profiles?.display_name ?? null,
    alias: row.prokicks_profiles?.alias ?? null
  })) as VisionSessionPlayer[];
}

export async function getSessionMetrics(sessionId: string): Promise<VisionMetric[]> {
  const { data, error } = await supabase.from('vision_metrics').select('*').eq('session_id', sessionId);
  if (error) {
    captureError(error, { area: 'vision', action: 'getSessionMetrics' });
    return [];
  }
  return (data || []) as VisionMetric[];
}

export async function getSessionEvents(sessionId: string): Promise<VisionEvent[]> {
  const { data, error } = await supabase
    .from('vision_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp_ms', { ascending: true });

  if (error) {
    captureError(error, { area: 'vision', action: 'getSessionEvents' });
    return [];
  }
  return (data || []) as VisionEvent[];
}

export async function getCoachHistory(coachId: string): Promise<VisionSession[]> {
  const { data, error } = await supabase
    .from('vision_sessions')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false });

  if (error) {
    captureError(error, { area: 'vision', action: 'getCoachHistory' });
    return [];
  }
  return (data || []) as VisionSession[];
}

export async function getPlayerHistory(playerId: string): Promise<{
  sessions: VisionSession[];
  metrics: VisionMetric[];
}> {
  const { data: sessionPlayers, error: spError } = await supabase
    .from('vision_session_players')
    .select('session_id')
    .eq('player_id', playerId);

  if (spError || !sessionPlayers?.length) {
    if (spError) captureError(spError, { area: 'vision', action: 'getPlayerHistory:sessions' });
    return { sessions: [], metrics: [] };
  }

  const sessionIds = sessionPlayers.map((s) => s.session_id);

  const [{ data: sessions }, { data: metrics }] = await Promise.all([
    supabase.from('vision_sessions').select('*').in('id', sessionIds).order('created_at', { ascending: false }),
    supabase.from('vision_metrics').select('*').eq('player_id', playerId).order('created_at', { ascending: false })
  ]);

  return {
    sessions: (sessions || []) as VisionSession[],
    metrics: (metrics || []) as VisionMetric[]
  };
}

export function pendingIfMissing(value: number | null | undefined): string {
  return value === null || value === undefined ? 'Pendiente de validación' : String(value);
}

export type { VisionMetricKey };
