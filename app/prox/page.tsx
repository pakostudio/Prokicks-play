'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Camera, Lock, Smartphone, UserRound, Zap } from 'lucide-react';
import { PROX_CATEGORIES } from '@/lib/vision/types';
import { PROX_METRIC_META, readProxResult, type ProxResult } from '@/lib/vision/proxResults';

type LocalProfile = {
  nickname?: string;
  avatar_image?: string;
};

export default function ProxPage() {
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<ProxResult | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem('prokicks_profile');
    if (raw) setProfile(JSON.parse(raw));
    setResult(readProxResult());
    setChecked(true);
  }, []);

  return (
    <AppShell active="home">
      <section className="hero section prox-hero">
        <div className="kicker">ProKicks ProX</div>
        <h1 className="h1">Mide tu progreso con lo que ya tienes</h1>
        <p className="p">
          No necesitas equipo robusto: con tu propio celular y un tripié registras salto, desplazamiento
          lateral, habilidad y más — sin cámaras dobles ni coach.
        </p>
        <div className="prox-req-row">
          <span className="prox-req"><Smartphone size={14} /> Tu celular</span>
          <span className="prox-req"><Camera size={14} /> Un tripié</span>
          <span className="prox-req"><Zap size={14} /> Listo para medir</span>
        </div>
      </section>

      {checked && !profile && (
        <section className="section">
          <div className="card prox-locked">
            <Lock size={22} />
            <h3 className="card-title">ProX es exclusivo para jugadores registrados</h3>
            <p className="p">Crea tu perfil ProKicks para desbloquear tus propias mediciones y llevar tu progreso.</p>
            <Link className="btn btn-primary btn-full" href="/registro">
              <UserRound size={18} /> Crear perfil para desbloquear ProX
            </Link>
          </div>
        </section>
      )}

      {checked && profile && (
        <>
          <section className="section">
            <div className="prox-stat-grid">
              {PROX_CATEGORIES.map((cat) => {
                const meta = PROX_METRIC_META[cat.key as keyof typeof PROX_METRIC_META];
                const value = result ? (result[cat.key as keyof ProxResult] as number) : null;
                return (
                  <div className="prox-stat-card" key={cat.key}>
                    <span className="prox-stat-label">{cat.label}</span>
                    <strong className="prox-stat-value">
                      {value !== null ? `${value.toFixed(meta.decimals)} ${meta.unit}` : 'Pendiente'}
                    </strong>
                    <span className="prox-stat-hint">{cat.hint}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="section">
            <div className="card">
              {result ? (
                <>
                  <h3 className="card-title">Ya tienes una medición ProX</h3>
                  <p className="p">Consulta tus resultados completos o repite la captura cuando quieras.</p>
                  <Link className="btn btn-primary btn-full" href="/prox/resultados">
                    Ver resultados completos
                  </Link>
                  <Link className="btn btn-soft btn-full mt-10" href="/prox/medicion">
                    <Camera size={18} /> Repetir medición
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="card-title">Tu primera medición ProX</h3>
                  <p className="p">
                    Coloca tu celular en el tripié, arranca una captura y ProX registrará tus métricas
                    automáticamente. No necesitas coach ni sesión grupal.
                  </p>
                  <Link className="btn btn-primary btn-full" href="/prox/medicion">
                    <Camera size={18} /> Iniciar medición ProX
                  </Link>
                </>
              )}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
