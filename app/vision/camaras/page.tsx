'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { CameraSelector } from '@/components/vision/CameraSelector';
import { supabase } from '@/lib/supabase';
import type { CameraDevice } from '@/lib/vision/engineClient';

function CamarasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const [cameras, setCameras] = useState<{ camera1?: CameraDevice; camera2?: CameraDevice }>({});
  const [saving, setSaving] = useState(false);

  async function continuar() {
    if (!sessionId) return;
    setSaving(true);
    await supabase
      .from('vision_sessions')
      .update({
        camera_1_label: cameras.camera1?.label || null,
        camera_2_label: cameras.camera2?.label || null,
        status: 'calibrating'
      })
      .eq('id', sessionId);
    setSaving(false);
    router.push(`/vision/calibracion?session=${sessionId}`);
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
        <h1 className="h1">Cámaras</h1>
        <p className="p">Conecta hasta 2 cámaras reconocidas por tu equipo (Windows o macOS).</p>
      </section>

      <section className="section">
        <CameraSelector onChange={setCameras} />
        <button
          type="button"
          className="btn btn-primary btn-full section"
          onClick={continuar}
          disabled={saving || (!cameras.camera1 && !cameras.camera2)}
        >
          {saving ? 'Guardando…' : 'Continuar a calibración'}
        </button>
      </section>
    </>
  );
}

export default function CamarasPage() {
  return (
    <AppShell active="home">
      <Suspense fallback={<p className="p muted section">Cargando…</p>}>
        <CamarasContent />
      </Suspense>
    </AppShell>
  );
}
