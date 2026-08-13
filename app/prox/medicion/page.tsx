'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Camera, Lock, UserRound } from 'lucide-react';
import { getPoseDetector, detectPose, SKELETON_PAIRS, kp, Keypoint } from '@/lib/vision/poseEngine';
import {
  Sample,
  calibrateScale,
  computeJumpHeightCm,
  computeLateralMetrics,
  computeReactionSeconds,
  computeSmoothnessScore,
} from '@/lib/vision/proxCapture';
import { saveProxResult } from '@/lib/vision/proxResults';

type LocalProfile = { nickname?: string; height_cm?: number };

type Phase =
  | 'idle'
  | 'requesting-camera'
  | 'camera-error'
  | 'loading-model'
  | 'calibrating'
  | 'countdown'
  | 'jump'
  | 'reaction-wait'
  | 'reaction-go'
  | 'lateral'
  | 'skill'
  | 'processing';

const PHASE_LABEL: Record<Phase, string> = {
  idle: '',
  'requesting-camera': 'Pidiendo acceso a tu cámara...',
  'camera-error': 'No pudimos acceder a tu cámara',
  'loading-model': 'Cargando motor de visión...',
  calibrating: 'Ponte de pie, cuerpo completo dentro del cuadro',
  countdown: '¡Prepárate!',
  jump: '¡Salta lo más alto que puedas!',
  'reaction-wait': 'Espera la señal...',
  'reaction-go': '¡Muévete ahora!',
  lateral: 'Muévete de lado a lado lo más rápido posible',
  skill: 'Movimientos libres de balón durante 5 segundos',
  processing: 'Calculando tus resultados...',
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ProxMedicionPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [checked, setChecked] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdownText, setCountdownText] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<Awaited<ReturnType<typeof getPoseDetector>> | null>(null);
  const runningRef = useRef(false);
  const bucketRef = useRef<Sample[] | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem('prokicks_profile');
    if (raw) setProfile(JSON.parse(raw));
    setChecked(true);
    return () => {
      runningRef.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function drawOverlay(keypoints: Keypoint[] | null) {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (keypoints) {
      ctx.strokeStyle = '#8FD3C7';
      ctx.lineWidth = 3;
      SKELETON_PAIRS.forEach(([a, b]) => {
        const ka = kp(keypoints, a);
        const kb = kp(keypoints, b);
        if (ka && kb) {
          ctx.beginPath();
          ctx.moveTo(ka.x, ka.y);
          ctx.lineTo(kb.x, kb.y);
          ctx.stroke();
        }
      });
      ctx.fillStyle = '#60A0B0';
      keypoints.forEach((k) => {
        if (k.score > 0.35) {
          ctx.beginPath();
          ctx.arc(k.x, k.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
    ctx.restore();
  }

  async function loop() {
    if (!runningRef.current || !videoRef.current || !detectorRef.current) return;
    try {
      const keypoints = await detectPose(detectorRef.current, videoRef.current);
      drawOverlay(keypoints);
      if (keypoints && bucketRef.current) {
        bucketRef.current.push({ t: performance.now(), keypoints });
      }
    } catch {
      // frame de deteccion fallido, se ignora y se sigue con el siguiente
    }
    if (runningRef.current) requestAnimationFrame(loop);
  }

  async function startCapture() {
    setPhase('requesting-camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setPhase('camera-error');
      return;
    }

    setPhase('loading-model');
    try {
      detectorRef.current = await getPoseDetector();
    } catch {
      setPhase('camera-error');
      return;
    }

    runningRef.current = true;
    requestAnimationFrame(loop);

    const heightCm = profile && profile.height_cm ? Number(profile.height_cm) : 170;

    setPhase('calibrating');
    bucketRef.current = [];
    await wait(2200);
    const calibSamples = bucketRef.current || [];
    const pxPerCm = calibrateScale(calibSamples, heightCm) || 4;

    setPhase('countdown');
    bucketRef.current = null;
    for (const n of ['3', '2', '1', '¡Salta!']) {
      setCountdownText(n);
      await wait(650);
    }

    setPhase('jump');
    bucketRef.current = [];
    await wait(2200);
    const jumpCm = computeJumpHeightCm(bucketRef.current || [], pxPerCm);

    setPhase('reaction-wait');
    bucketRef.current = [];
    await wait(1200 + Math.random() * 1800);
    const cueTimeMs = performance.now();
    setPhase('reaction-go');
    await wait(1500);
    const reactionSeconds = computeReactionSeconds(cueTimeMs, bucketRef.current || []);

    setPhase('lateral');
    bucketRef.current = [];
    await wait(6000);
    const lateral = computeLateralMetrics(bucketRef.current || [], pxPerCm);

    setPhase('skill');
    bucketRef.current = [];
    await wait(5000);
    const smoothness = computeSmoothnessScore(bucketRef.current || []);

    setPhase('processing');
    bucketRef.current = null;
    runningRef.current = false;
    streamRef.current?.getTracks().forEach((t) => t.stop());

    saveProxResult({
      salto_altura: jumpCm,
      desplazamiento_lateral: lateral.maxSpeedMs,
      habilidad_tecnica: smoothness,
      velocidad_aproximada: lateral.avgSpeedKmh,
      tiempo_reaccion: reactionSeconds,
      consistencia: lateral.consistency,
      measured_at: new Date().toISOString(),
    });

    await wait(600);
    router.push('/prox/resultados');
  }

  const showOverlay = phase !== 'idle' && phase !== 'camera-error';

  return (
    <AppShell active="home">
      <section className="hero section prox-hero">
        <div className="kicker">ProKicks ProX</div>
        <h1 className="h1">Medición ProX</h1>
        <p className="p">
          Coloca tu celular en un tripié a la altura del pecho, a unos 2-3 metros de distancia. Vas a hacer
          4 pruebas cortas guiadas por la app: salto, reacción, movimiento lateral y footwork libre. Nada se
          graba ni se sube a internet, todo se procesa en tu celular.
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
            <div className="scan-frame mt-10" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
              <video ref={videoRef} playsInline muted style={{ display: 'none' }} />
              <canvas
                ref={canvasRef}
                style={{ width: '100%', borderRadius: 20, display: showOverlay ? 'block' : 'none' }}
              />
              {phase === 'idle' && (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <Camera size={32} />
                  <strong style={{ display: 'block', marginTop: 8 }}>Cámara lista</strong>
                  <span className="p">
                    Vas a hacer 4 pruebas cortas: salto, reacción, movimiento lateral y footwork libre.
                  </span>
                </div>
              )}
              {phase === 'camera-error' && (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <strong>No pudimos usar tu cámara</strong>
                  <p className="p">Revisa los permisos de cámara de tu navegador e inténtalo de nuevo.</p>
                </div>
              )}
              {showOverlay && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    right: 10,
                    textAlign: 'center',
                    background: 'rgba(15,38,71,0.72)',
                    color: '#fff',
                    borderRadius: 12,
                    padding: '8px 10px',
                    fontWeight: 700,
                  }}
                >
                  {phase === 'countdown' ? countdownText : PHASE_LABEL[phase]}
                </div>
              )}
            </div>

            {(phase === 'idle' || phase === 'camera-error') && (
              <button className="btn btn-primary btn-full" onClick={startCapture}>
                {phase === 'camera-error' ? 'Reintentar' : 'Iniciar captura'}
              </button>
            )}
          </div>
        </section>
      )}
    </AppShell>
  );
}
