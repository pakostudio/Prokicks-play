'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { createVisionSession, assignSessionPlayers } from '@/lib/vision/supabaseVision';
import { trackVisionEvent, VISION_OBSERVABILITY_EVENTS } from '@/lib/vision/events';
import { captureError } from '@/lib/monitoring';

type ProfileOption = { id: string; display_name: string | null; alias: string | null };

export default function NuevaSesionPage() {
  const router = useRouter();
  const [coachId, setCoachId] = useState<string | null>(null);
  const [players, setPlayers] = useState<ProfileOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCoachId(data.user?.id || null));
    supabase
      .from('prokicks_profiles')
      .select('id, display_name, alias')
      .order('display_name', { ascending: true })
      .limit(100)
      .then(({ data, error: fetchError }) => {
        if (fetchError) captureError(fetchError, { area: 'vision', action: 'loadPlayers' });
        setPlayers((data || []) as ProfileOption[]);
      });
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  async function continuar() {
    if (!coachId) {
      setError('Debes iniciar sesión como coach para crear una sesión.');
      return;
    }
    if (selected.length < 1) {
      setError('Selecciona al menos 1 jugador.');
      return;
    }

    setLoading(true);
    setError(null);

    const session = await createVisionSession({ coachId });
    if (!session) {
      setLoading(false);
      setError('No se pudo crear la sesión.');
      return;
    }

    await assignSessionPlayers(
      session.id,
      selected.map((playerId, idx) => ({ playerId, positionNumber: (idx + 1) as 1 | 2 | 3 | 4 }))
    );

    trackVisionEvent(VISION_OBSERVABILITY_EVENTS.sessionCreated, {
      session_id: session.id,
      players_count: selected.length
    });

    setLoading(false);
    router.push(`/vision/camaras?session=${session.id}`);
  }

  return (
    <AppShell active="home">
      <section className="hero section">
        <div className="kicker">ProKicks Vision</div>
        <h1 className="h1">Nueva sesión</h1>
        <p className="p">Selecciona de 1 a 4 jugadores para este bloque de entrenamiento.</p>
      </section>

      <section className="section">
        <div className="card">
          {!players.length && <p className="p muted">Cargando jugadores…</p>}
          <div className="list">
            {players.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`btn ${selected.includes(p.id) ? 'btn-primary' : 'btn-soft'} btn-full`}
                onClick={() => toggle(p.id)}
              >
                {p.display_name || p.alias || p.id}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="p vision-error">{error}</p>}

        <button
          type="button"
          className="btn btn-primary btn-full section"
          onClick={continuar}
          disabled={loading}
        >
          {loading ? 'Creando sesión…' : 'Continuar a cámaras'}
        </button>
      </section>
    </AppShell>
  );
}
