'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { findSpotByCode, mapEmbedUrl, realSpots } from '@/lib/demo';

export default function ScanPage(){
  const [code,setCode]=useState('PK-INDOOR-001');
  const [msg,setMsg]=useState('');
  const [spot,setSpot]=useState<(typeof realSpots)[number] | null>(realSpots[0]);
  function lookup(){
    setMsg('');
    const found = findSpotByCode(code);
    if(!found){ setSpot(null); setMsg('Código no encontrado. Revisa el QR o ingresa el código del spot.'); return; }
    setSpot(found);
  }
  return <AppShell active="scan">
    <section className="hero section"><div className="kicker">QR / Spot</div><h1 className="h1">Escanear QR / conectar spot para Reta</h1><p className="p">Escanea el QR del spot o ingresa el código para iniciar una reta.</p></section>
    <section className="qr-box section"><div><strong>Cámara próximamente</strong><p className="p">Escaneo con cámara próximamente. Por ahora ingresa el código del spot.</p></div></section>
    <section className="card form section">
      <input className="input" value={code} onChange={e=>setCode(e.target.value)} placeholder="Código QR" />
      {msg && <div className="alert error">{msg}</div>}
      <button className="btn btn-primary" onClick={lookup}>Detectar spot</button>
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
