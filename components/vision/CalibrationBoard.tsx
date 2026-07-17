'use client';

import { useState } from 'react';
import type { VisionSessionPlayer } from '@/lib/vision/types';
import { saveCalibration } from '@/lib/vision/supabaseVision';
import { trackVisionEvent, VISION_OBSERVABILITY_EVENTS } from '@/lib/vision/events';

// Detección de personas: en producción, el ProKicks Vision Engine (proceso
// externo) envía bounding boxes en vivo vía WebSocket/polling a esta pantalla.
// Aquí se deja el punto de integración (detectedPersons prop) para no
// bloquear la UI mientras ese canal no exista todavía.
type DetectedPerson = {
  trackingId: string;
  boundingBox: { x: number; y: number; width: number; height: number };
};

type Props = {
  sessionId: string;
  cameraId: string;
  players: VisionSessionPlayer[];
  detectedPersons?: DetectedPerson[];
  onAssigned?: (playerId: string, trackingId: string) => void;
};

export function CalibrationBoard({ sessionId, cameraId, players, detectedPersons = [], onAssigned }: Props) {
  const [pendingPlayerId, setPendingPlayerId] = useState<string>(players[0]?.player_id || '');
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function assign(person: DetectedPerson) {
    if (!pendingPlayerId) return;
    setAssigning(true);
    setError(null);
    const result = await saveCalibration({
      sessionId,
      cameraId,
      playerId: pendingPlayerId,
      trackingId: person.trackingId,
      boundingBox: person.boundingBox
    });
    setAssigning(false);

    if (!result) {
      setError('No se pudo guardar la calibración.');
      trackVisionEvent(VISION_OBSERVABILITY_EVENTS.calibrationFailed, { session_id: sessionId });
      return;
    }

    trackVisionEvent(VISION_OBSERVABILITY_EVENTS.calibrationCompleted, {
      session_id: sessionId,
      player_id: pendingPlayerId
    });
    onAssigned?.(pendingPlayerId, person.trackingId);

    const remaining = players.find((p) => p.player_id !== pendingPlayerId && !p.tracking_id);
    if (remaining) setPendingPlayerId(remaining.player_id);
  }

  return (
    <section className="card vision-calibration-board">
      <h3 className="card-title">Calibración</h3>
      <p className="p">Toca a cada jugador detectado en la vista previa para asignarlo.</p>

      <div className="grid-2 vision-player-picker">
        {players.map((p, idx) => (
          <button
            key={p.player_id}
            type="button"
            className={`btn ${pendingPlayerId === p.player_id ? 'btn-primary' : 'btn-soft'}`}
            onClick={() => setPendingPlayerId(p.player_id)}
          >
            J{idx + 1} · {p.display_name || p.alias || 'Jugador'}
            {p.tracking_id ? ' ✓' : ''}
          </button>
        ))}
      </div>

      {error && <p className="p vision-error">{error}</p>}

      <div className="vision-detection-canvas">
        {!detectedPersons.length && (
          <p className="p muted">
            Esperando detección de personas del motor de visión. Conecta el ProKicks Vision Engine para
            ver jugadores detectados aquí.
          </p>
        )}
        {detectedPersons.map((person) => (
          <button
            key={person.trackingId}
            type="button"
            className="vision-person-box"
            disabled={assigning}
            style={{
              left: `${person.boundingBox.x}%`,
              top: `${person.boundingBox.y}%`,
              width: `${person.boundingBox.width}%`,
              height: `${person.boundingBox.height}%`
            }}
            onClick={() => assign(person)}
          >
            {person.trackingId}
          </button>
        ))}
      </div>
    </section>
  );
}
