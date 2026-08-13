'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Camera, Lock, UserRound } from 'lucide-react';
import { generateDemoProxResult, saveProxResult } from '@/lib/vision/proxResults';

type LocalProfile = {
  nickname?: string;
};

export default function ProxMedicionPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [checked, setChecked] = useState(false);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem('prokicks_profile');
    if (raw) setProfile(JSON.parse(raw));
    setChecked(true);
  }, []);

  function startCapture() {
    setCapturing(true);
    setTimeout(() => {
      const result = generateDemoProxResult();
      saveProxResult(result);
      router.push('/prox/resultados');
    }, 1800);
  }

  return (
    <AppShell active="home">
      <section className="hero section prox-hero">
        <div className="kicker">ProKicks ProX</div>
        <h1 className="h1">Medición ProX</h1>
        <p className="p">
          Coloca tu celular en el tripié, alinea tu cuerpo dentro del cuadro y arranca la captura.
        </p>
      </section>

      {checked && !profile && (
        <section className="section">
          <div className="card prox-locked">
            <Lock size={22} />
            <h3 className="card-title">ProX es exclusivo para jugadores registrados</h3>
            <p className="p">Crea tu perfil ProKicks para desbloquear tus propias mediciones.</p>
            <Link className="btn btn-primary btn-full" href="/registro">
              <UserRound size={18} /> Crear perfil para desbloquear ProX
            </Link>
          </div>
        </section>
      )}

      {checked && profile && (
        <section className="section">
          <div className="card">
            <div className="scan-frame mt-10">
              {capturing ? (
                <>
                  <div className="scan-pulse" />
                  <strong>Capturando movimiento...</strong>
                  <span className="p">No te muevas del cuadro.</span>
                </>
              ) : (
                <>
                  <Camera size={32} />
                  <strong>Cámara lista</strong>
                  <span className="p">Alinea tu cuerpo dentro del cuadro para iniciar.</span>
                </>
              )}
            </div>
            <button className="btn btn-primary btn-full" onClick={startCapture} disabled={capturing}>
              {capturing ? 'Capturando...' : 'Iniciar captura'}
            </button>
          </div>
        </section>
      )}
    </AppShell>
  );
}
