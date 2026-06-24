import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { demoSpots } from '@/lib/demo';

export default function SpotDetail({ params }:{ params:{ id:string }}){
  const spot = demoSpots.find(s=>s.id===params.id) || demoSpots[0];
  return <AppShell active="map">
    <section className="hero section"><div className="kicker">Spot activo</div><h1 className="h1">{spot.name}</h1><p className="p">{spot.address}</p></section>
    <section className="grid-2 section">
      <div className="stat"><span className="muted">Estado</span><strong style={{fontSize:18}}>{spot.status}</strong></div>
      <div className="stat"><span className="muted">Actividad</span><strong>{spot.activity_score}</strong></div>
    </section>
    <section className="grid section">
      <Link className="btn btn-primary btn-full" href={`/retas/nueva?spot=${spot.id}`}>Crear reta aquí</Link>
      <Link className="btn btn-warm btn-full" href="/scan">Escanear QR</Link>
      <Link className="btn btn-soft btn-full" href="/retas">Ver retas activas</Link>
    </section>
  </AppShell>
}
