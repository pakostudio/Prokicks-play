'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { CalibrationBoard } from '@/components/vision/CalibrationBoard';
import { getSessionPlayers, startVisionSession } from '@/lib/vision/supabaseVision';
import { trackVisionEvent, VISION_OBSERVABILITY_EVENTS } from '@/lib/vision/events';
import type { VisionSessionPlayer } from '@/lib/vision/types';

function CalibracionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const [players, setPlayers] = useState<VisionSessionPlayer[]>([]);
  const [starting, setStarting] = useState(false);

  async function reload() {
    if (!sessionId) return;
    setPlayers(await getSessionPlayers(sessionId));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const allAssigned = players.length > 0 && players.every((p) => p.tracking_id);

  async function iniciar() {
    if (!sessionId) return;
    setStarting(true);
    const ok = await startVisionSession(sessionId);
    setStarting(false);
    if (ok) {
      trackVisionEvent(VISION_OBSERVABILITY_EVENTS.sessionStarted, { session_id: sessionId });
      router.push(`/vision/sesion/${sessionId}`);
    }
  }

  if (!sessionId) {
    return (
      <section className="section">
        <div className="card">
          <p className="p">Falta el identificador de sesión. Vuelve a Nueva sesión.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="hero section">
        <div className="kicker">ProKicks Vision</div>
        <h1 className="h1">Calibración</h1>
        <p className="p">Asigna cada jugador detectado tocando su recuadro en la vista previa.</p>
      </section>

      <section className="section">
        <CalibrationBoard
          sessionId={sessionId}
          cameraId="camera_1"
          players={players}
          onAssigned={reload}
        />

        <button
          type="button"
          className="btn btn-primary btn-full section"
          onClick={iniciar}
          disabled={!allAssigned || starting}
        >
          {starting ? 'Iniciando…' : allAssigned ? 'Iniciar sesión (20 min)' : 'Faltan jugadores por calibrar'}
        </button>
      </section>
    </>
  );
}

export default function CalibracionPage() {
  return (
    <AppShell active="home">
      <Suspense fallback={<p className="p muted section">Cargando…</p>}>
        <CalibracionContent />
      </Suspense>
    </AppShell>
  );
}
