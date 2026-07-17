'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { EvolutionChart } from '@/components/vision/EvolutionChart';
import { getPlayerHistory, pendingIfMissing } from '@/lib/vision/supabaseVision';
import { VISION_METRIC_KEYS, VISION_METRIC_LABELS } from '@/lib/vision/types';
import type { VisionSession, VisionMetric } from '@/lib/vision/types';

// Consulta propia: RLS permite que el jugador solo vea sus propias métricas
// (auth.uid() = player_id) o que su coach/admin las vea.
export default function JugadorPage() {
  const params = useParams<{ id: string }>();
  const playerId = params.id;

  const [sessions, setSessions] = useState<VisionSession[]>([]);
  const [metrics, setMetrics] = useState<VisionMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlayerHistory(playerId).then(({ sessions: s, metrics: m }) => {
      setSessions(s);
      setMetrics(m);
      setLoading(false);
    });
  }, [playerId]);

  const contactosEvolucion = metrics
    .filter((m) => m.metric_key === 'contactos_estimados' && m.metric_value !== null)
    .map((m) => m.metric_value as number)
    .reverse();

  const latestByKey: Record<string, VisionMetric> = {};
  metrics.forEach((m) => {
    if (!latestByKey[m.metric_key]) latestByKey[m.metric_key] = m;
  });

  return (
    <AppShell active="perfil">
      <section className="hero section">
        <div className="kicker">ProKicks Vision</div>
        <h1 className="h1">Perfil de jugador</h1>
        <p className="p">Rendimiento acumulado en ProKicks Vision.</p>
      </section>

      <section className="section">
        {loading && <p className="p muted">Cargando…</p>}

        {!loading && (
          <>
            <div className="card">
              <h3 className="card-title">Últimas métricas</h3>
              <table className="vision-metrics-table">
                <tbody>
                  {VISION_METRIC_KEYS.map((key) => (
                    <tr key={key}>
                      <td>{VISION_METRIC_LABELS[key]}</td>
                      <td>
                        {pendingIfMissing(latestByKey[key]?.metric_value ?? null)}
                        {latestByKey[key]?.metric_unit ? ` ${latestByKey[key]?.metric_unit}` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card section">
              <h3 className="card-title">Evolución — contactos estimados</h3>
              <EvolutionChart values={contactosEvolucion} />
            </div>

            <div className="card section">
              <h3 className="card-title">Sesiones</h3>
              <div className="list">
                {sessions.map((s) => (
                  <div className="row" key={s.id}>
                    <span>Bloque {s.block_number}</span>
                    <span className="muted">{new Date(s.created_at).toLocaleDateString('es-MX')}</span>
                  </div>
                ))}
                {!sessions.length && <p className="p muted">Sin sesiones todavía.</p>}
              </div>
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}
