'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Camera, RotateCcw } from 'lucide-react';
import { PROX_CATEGORIES } from '@/lib/vision/types';
import { PROX_METRIC_META, readProxResult, type ProxResult } from '@/lib/vision/proxResults';

export default function ProxResultadosPage() {
  const [result, setResult] = useState<ProxResult | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setResult(readProxResult());
    setChecked(true);
  }, []);

  function barPercent(value: number, communityAvg: number, higherIsBetter: boolean) {
    const scaleMax = Math.max(value, communityAvg) * 1.4;
    const raw = (value / scaleMax) * 100;
    return Math.max(6, Math.min(96, raw));
  }

  function avgPercent(value: number, communityAvg: number) {
    const scaleMax = Math.max(value, communityAvg) * 1.4;
    return Math.max(2, Math.min(98, (communityAvg / scaleMax) * 100));
  }

  return (
    <AppShell active="home">
      <section className="hero section prox-hero">
        <div className="kicker">ProKicks ProX</div>
        <h1 className="h1">Tus resultados</h1>
        <p className="p">Comparados contra el promedio de la comunidad ProKicks.</p>
      </section>

      {checked && !result && (
        <section className="section">
          <div className="card">
            <h3 className="card-title">Todavía no tienes una medición</h3>
            <p className="p">Haz tu primera captura para ver tus resultados aquí.</p>
            <Link className="btn btn-primary btn-full" href="/prox/medicion">
              <Camera size={18} /> Iniciar medición ProX
            </Link>
          </div>
        </section>
      )}

      {checked && result && (
        <>
          <section className="section">
            <div className="prox-result-list">
              {PROX_CATEGORIES.map((cat) => {
                const meta = PROX_METRIC_META[cat.key as keyof typeof PROX_METRIC_META];
                const value = result[cat.key as keyof ProxResult] as number;
                const fill = barPercent(value, meta.communityAvg, meta.higherIsBetter);
                const avgPos = avgPercent(value, meta.communityAvg);
                const isUp = meta.higherIsBetter ? value >= meta.communityAvg : value <= meta.communityAvg;
                return (
                  <div className="prox-result-card" key={cat.key}>
                    <span className="prox-stat-label">{cat.label}</span>
                    <div className={`prox-result-value ${isUp ? 'up' : ''}`}>
                      {value.toFixed(meta.decimals)} {meta.unit}
                    </div>
                    <div className="prox-bar-track">
                      <div className="prox-bar-fill" style={{ width: `${fill}%` }} />
                      <div className="prox-bar-avg-marker" style={{ left: `${avgPos}%` }} />
                    </div>
                    <span className="prox-stat-hint">Promedio comunidad: {meta.communityAvg}{meta.unit}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="section grid">
            <Link className="btn btn-soft btn-full" href="/prox/medicion">
              <RotateCcw size={18} /> Repetir medición
            </Link>
            <Link className="btn btn-primary btn-full" href="/prox">
              Volver a ProX
            </Link>
          </section>
        </>
      )}
    </AppShell>
  );
}
