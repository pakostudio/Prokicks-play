'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { SessionTimer } from '@/components/vision/SessionTimer';
import { MetricsPanel } from '@/components/vision/MetricsPanel';
import {
  getSession,
  getSessionPlayers,
  getSessionMetrics,
  pauseVisionSession,
  completeVisionSession,
  startNextBlock
} from '@/lib/vision/supabaseVision';
import { trackVisionEvent, VISION_OBSERVABILITY_EVENTS } from '@/lib/vision/events';
import type { VisionSession, VisionSessionPlayer, VisionMetric } from '@/lib/vision/types';

export default function SesionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sessionId = params.id;

  const [session, setSession] = useState<VisionSession | null>(null);
  const [players, setPlayers] = useState<VisionSessionPlayer[]>([]);
  const [metrics, setMetrics] = useState<VisionMetric[]>([]);
  const [paused, setPaused] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    getSession(sessionId).then(setSession);
    getSessionPlayers(sessionId).then(setPlayers);
    getSessionMetrics(sessionId).then(setMetrics);
  }, [sessionId]);

  async function handlePauseToggle() {
    const nextPaused = !paused;
    setPaused(nextPaused);
    await pauseVisionSession(sessionId, nextPaused);
    trackVisionEvent(
      nextPaused ? VISION_OBSERVABILITY_EVENTS.sessionPaused : VISION_OBSERVABILITY_EVENTS.sessionStarted,
      { session_id: sessionId }
    );
  }

  async function finalizarBloque(durationSeconds: number, auto: boolean) {
    await completeVisionSession(sessionId, durationSeconds);
    trackVisionEvent(VISION_OBSERVABILITY_EVENTS.sessionCompleted, {
      session_id: sessionId,
      auto,
      duration_seconds: durationSeconds
    });

    if (auto) {
      setAlertMsg('Bloque de 20 minutos completado. Se guardó automáticamente.');
    } else {
      router.push(`/vision/resultados/${sessionId}`);
    }
  }

  async function handleAutoComplete() {
    await finalizarBloque(20 * 60, true);
  }

  async function handleFinish() {
    await finalizarBloque(0, false);
  }

  async function iniciarSiguienteBloque() {
    const next = await startNextBlock(sessionId);
    if (next) {
      router.push(`/vision/sesion/${next.id}`);
    }
  }

  function abrirMetricas() {
    setPanelOpen(true);
    trackVisionEvent(VISION_OBSERVABILITY_EVENTS.metricsViewed, { session_id: sessionId });
  }

  const metricsByPlayer: Record<string, VisionMetric[]> = {};
  metrics.forEach((m) => {
    if (!metricsByPlayer[m.player_id]) metricsByPlayer[m.player_id] = [];
    metricsByPlayer[m.player_id].push(m);
  });
  const playerNames: Record<string, string> = {};
  players.forEach((p) => {
    playerNames[p.player_id] = p.display_name || p.alias || 'Jugador';
  });

  return (
    <AppShell active="home">
      <section className="hero section">
        <div className="kicker">ProKicks Vision</div>
        <h1 className="h1">Sesión en curso</h1>
        <p className="p">
          Bloque {session?.block_number || 1} · Cámaras: {session?.camera_1_label || '—'} /{' '}
          {session?.camera_2_label || '—'}
        </p>
      </section>

      <section className="section">
        <SessionTimer
          running={Boolean(session)}
          paused={paused}
          onAutoComplete={handleAutoComplete}
          onPauseToggle={handlePauseToggle}
          onFinish={handleFinish}
        />

        <button type="button" className="btn btn-soft btn-full section" onClick={abrirMetricas}>
          Ver métricas
        </button>

        <div className="grid-2 section">
          {players.map((p, idx) => (
            <div className="card vision-player-mini-card" key={p.id}>
              <strong>J{idx + 1}</strong>
              <span>{p.display_name || p.alias || 'Jugador'}</span>
              <span className="muted">{p.tracking_id ? 'Calibrado' : 'Sin calibrar'}</span>
            </div>
          ))}
        </div>

        {alertMsg && (
          <div className="card section">
            <p className="p">{alertMsg}</p>
            <div className="grid-2">
              <button type="button" className="btn btn-primary" onClick={iniciarSiguienteBloque}>
                Iniciar sesión {(session?.block_number || 1) + 1} (20 min)
              </button>
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => router.push(`/vision/resultados/${sessionId}`)}
              >
                Ver resultados
              </button>
            </div>
          </div>
        )}
      </section>

      <MetricsPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        metricsByPlayer={metricsByPlayer}
        playerNames={playerNames}
      />
    </AppShell>
  );
}
