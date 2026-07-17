'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { EvolutionChart } from '@/components/vision/EvolutionChart';
import {
  getSession,
  getSessionPlayers,
  getSessionMetrics,
  getPlayerHistory,
  pendingIfMissing
} from '@/lib/vision/supabaseVision';
import { VISION_METRIC_KEYS, VISION_METRIC_LABELS } from '@/lib/vision/types';
import type { VisionSession, VisionSessionPlayer, VisionMetric } from '@/lib/vision/types';

export default function ResultadosPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;

  const [session, setSession] = useState<VisionSession | null>(null);
  const [players, setPlayers] = useState<VisionSessionPlayer[]>([]);
  const [metrics, setMetrics] = useState<VisionMetric[]>([]);
  const [history, setHistory] = useState<Record<string, VisionMetric[]>>({});

  useEffect(() => {
    getSession(sessionId).then(setSession);
    getSessionPlayers(sessionId).then(setPlayers);
    getSessionMetrics(sessionId).then(setMetrics);
  }, [sessionId]);

  useEffect(() => {
    if (!players.length) return;
    players.forEach((p) => {
      getPlayerHistory(p.player_id).then(({ metrics: playerMetrics }) => {
        setHistory((prev) => ({ ...prev, [p.player_id]: playerMetrics }));
      });
    });
  }, [players]);

  return (
    <AppShell active="home">
      <section className="hero section">
        <div className="kicker">ProKicks Vision</div>
        <h1 className="h1">Resultados</h1>
        <p className="p">
          Bloque {session?.block_number || 1} · Duración{' '}
          {session?.duration_seconds ? `${Math.round(session.duration_seconds / 60)} min` : 'Pendiente de validación'}
        </p>
      </section>

      <section className="section">
        {players.map((p, idx) => {
          const playerMetrics = metrics.filter((m) => m.player_id === p.player_id);
          const key = 'contactos_estimados' as const;
          const evolutionValues = (history[p.player_id] || [])
            .filter((m) => m.metric_key === key && m.metric_value !== null)
            .map((m) => m.metric_value as number)
            .reverse();
          const personalRecord = evolutionValues.length ? Math.max(...evolutionValues) : null;

          return (
            <article className="card section" key={p.id}>
              <div className="row">
                <h3 className="card-title">
                  J{idx + 1} · {p.display_name || p.alias || 'Jugador'}
                </h3>
                <Link className="tag tag-blue" href={`/vision/jugador/${p.player_id}`}>
                  Ver perfil
                </Link>
              </div>

              <table className="vision-metrics-table">
                <tbody>
                  {VISION_METRIC_KEYS.map((metricKey) => {
                    const metric = playerMetrics.find((m) => m.metric_key === metricKey);
                    return (
                      <tr key={metricKey}>
                        <td>{VISION_METRIC_LABELS[metricKey]}</td>
                        <td>
                          {pendingIfMissing(metric?.metric_value ?? null)}
                          {metric?.metric_unit ? ` ${metric.metric_unit}` : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <p className="p muted section">Evolución — contactos estimados</p>
              <EvolutionChart values={evolutionValues} />

              <p className="p">
                Récord personal: {personalRecord !== null ? personalRecord : 'Pendiente de validación'}
              </p>
              <p className="p">Área de mejora: Pendiente de validación</p>
            </article>
          );
        })}

        {!players.length && <p className="p muted">Cargando resultados…</p>}
      </section>
    </AppShell>
  );
}
