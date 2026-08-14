'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { Camera, X } from 'lucide-react';
import { findSpotByCode, mapEmbedUrl, realSpots } from '@/lib/demo';
import jsQR from 'jsqr';

export default function ScanPage(){
  const router = useRouter();
  const [code,setCode]=useState('PK-INDOOR-001');
  const [msg,setMsg]=useState('');
  const [spot,setSpot]=useState<(typeof realSpots)[number] | null>(realSpots[0]);
  const [checkInCode,setCheckInCode]=useState('');
  const [scanning,setScanning]=useState(false);
  const [cameraError,setCameraError]=useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  function stopScan(){
    setScanning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  useEffect(() => () => stopScan(), []);

  function scanFrame(){
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) { rafRef.current = requestAnimationFrame(scanFrame); return; }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
    if (result && result.data) {
      setCode(result.data);
      stopScan();
      lookup(result.data);
      return;
    }
    rafRef.current = requestAnimationFrame(scanFrame);
  }

  async function startScan(){
    setCameraError('');
    setMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch {
      setCameraError('No pudimos acceder a tu cámara. Revisa los permisos del navegador o ingresa el código manualmente.');
    }
  }

  function lookup(rawValue?: string){
    setMsg('');
    setCheckInCode('');
    const value = (rawValue ?? code).trim();
    if(value.includes('/torneos/')){
      try {
        const url = new URL(value);
        router.push(url.pathname);
      } catch {
        const path = value.slice(value.indexOf('/torneos/'));
        router.push(path);
      }
      return;
    }
    if(value.toLowerCase().includes('check-in') || value.toLowerCase().startsWith('checkin:')){
      setSpot(null);
      setCheckInCode(value.replace(/^checkin:/i, '').trim());
      setMsg('Código de check-in detectado. Admin puede validarlo ahora.');
      return;
    }
    const found = findSpotByCode(value);
    if(!found){ setSpot(null); setMsg('Código no encontrado. Revisa el QR o ingresa el código del spot.'); return; }
    setSpot(found);
  }

  return <AppShell active="scan">
    <section className="hero section"><div className="kicker">QR / Spot</div><h1 className="h1">Escanear QR / conectar spot para Reta</h1><p className="p">Escanea el QR del spot con tu cámara o ingresa el código para iniciar una reta.</p></section>

    <section className="qr-box section" style={{ padding: scanning ? 0 : undefined, overflow: 'hidden' }}>
      {!scanning && (
        <div>
          <strong>Escanea el QR del spot</strong>
          <p className="p">Apunta tu cámara al código que está en el spot. Todo se procesa en tu celular.</p>
          <button className="btn btn-primary btn-full" onClick={startScan} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }}>
            <Camera size={18} /> Activar cámara
          </button>
          {cameraError && <div className="alert error" style={{ marginTop: 10 }}>{cameraError}</div>}
        </div>
      )}
      {scanning && (
        <div style={{ position: 'relative' }}>
          <video ref={videoRef} playsInline muted style={{ width: '100%', display: 'block', borderRadius: 20 }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div
            style={{
              position: 'absolute',
              inset: '15%',
              border: '3px solid #8FD3C7',
              borderRadius: 16,
              boxShadow: '0 0 0 2000px rgba(15,38,71,0.35)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              right: 10,
              textAlign: 'center',
              background: 'rgba(15,38,71,0.85)',
              color: '#fff',
              borderRadius: 12,
              padding: '10px 12px',
              fontWeight: 700,
            }}
          >
            Apunta al QR del spot
          </div>
          <button
            type="button"
            onClick={stopScan}
            aria-label="Cerrar cámara"
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(15,38,71,0.85)',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </section>

    <section className="card form section">
      <input className="input" value={code} onChange={e=>setCode(e.target.value)} placeholder="Código QR" />
      {msg && <div className={checkInCode ? 'alert ok' : 'alert error'}>{msg}</div>}
      <button className="btn btn-primary" onClick={() => lookup()}>Detectar spot</button>
      {checkInCode && <div className="card"><h3 className="card-title">Check-in preparado</h3><p className="p">Código: {checkInCode}</p><Link className="btn btn-soft btn-full" href={`/admin/check-in?code=${encodeURIComponent(checkInCode)}`}>Validar check-in</Link></div>}
      {spot && <div className="card spot-card">
        <iframe className="map-embed" src={mapEmbedUrl(spot.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Mapa ${spot.name}`} />
        <div className="row"><h3 className="card-title">{spot.name}</h3><span className="tag tag-blue">{spot.code}</span></div>
        <p className="field-label">Ubicación del spot</p>
        <p className="p">{spot.address}</p>
        <Link className="btn btn-warm btn-full" href={spot.maps_url} target="_blank">Abrir en Google Maps</Link>
        <Link className="btn btn-primary btn-full" href={`/retas/nueva?spot=${spot.id}`}>Crear reta en este spot</Link>
      </div>}
    </section>
  </AppShell>
}
