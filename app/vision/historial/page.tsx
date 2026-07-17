'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { getCoachHistory } from '@/lib/vision/supabaseVision';
import type { VisionSession } from '@/lib/vision/types';

export default function HistorialPage() {
  const [sessions, setSessions] = useState<VisionSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const coachId = data.user?.id;
      if (!coachId) {
        setLoading(false);
        return;
      }
      setSessions(await getCoachHistory(coachId));
      setLoading(false);
    });
  }, []);

  return (
    <AppShell active="home">
      <section className="hero section">
        <div className="kicker">ProKicks Vision</div>
        <h1 className="h1">Historial</h1>
        <p className="p">Todas tus sesiones y bloques de entrenamiento registrados.</p>
      </section>

      <section className="section">
        {loading && <p className="p muted">Cargando…</p>}
        {!loading && !sessions.length && (
          <div className="card">
            <p className="p">Aún no tienes sesiones registradas.</p>
            <Link className="btn btn-primary btn-full section" href="/vision/nueva-sesion">
              Crear la primera sesión
            </Link>
          </div>
        )}

        <div className="list">
          {sessions.map((s) => (
            <article className="card" key={s.id}>
              <div className="row">
                <h3 className="card-title">Bloque {s.block_number}</h3>
                <span className="tag tag-blue">{s.status}</span>
              </div>
              <p className="p">
                {new Date(s.created_at).toLocaleString('es-MX')} ·{' '}
                {s.duration_seconds ? `${Math.round(s.duration_seconds / 60)} min` : 'En curso'}
              </p>
              {s.status === 'completed' ? (
                <Link className="btn btn-primary btn-full" href={`/vision/resultados/${s.id}`}>
                  Ver resultados
                </Link>
              ) : (
                <Link className="btn btn-soft btn-full" href={`/vision/sesion/${s.id}`}>
                  Continuar sesión
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
