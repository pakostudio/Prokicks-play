import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { mapEmbedUrl, realSpots } from '@/lib/demo';

export default function SpotDetail({ params }:{ params:{ id:string }}){
  const spot = realSpots.find(s=>s.id===params.id) || realSpots[0];
  return <AppShell active="map">
    <section className="hero section"><div className="kicker">Spot activo</div><h1 className="h1">{spot.name}</h1><p className="p">{spot.address}</p></section>
    <section className="grid-2 section">
      <div className="stat"><span className="muted">Estado</span><strong style={{fontSize:18}}>{spot.status}</strong></div>
      <div className="stat"><span className="muted">Código</span><strong style={{fontSize:18}}>{spot.code}</strong></div>
    </section>
    <section className="card section spot-card">
      <iframe className="map-embed" src={mapEmbedUrl(spot.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Mapa ${spot.name}`} />
      <h2 className="card-title">Ubicación del spot</h2>
      <p className="p">{spot.address}</p>
      <Link className="btn btn-warm btn-full" href={spot.maps_url} target="_blank">Abrir en Google Maps</Link>
    </section>
    <section className="grid section">
      <Link className="btn btn-primary btn-full" href={`/retas/nueva?spot=${spot.id}`}>Crear reta aquí</Link>
      <Link className="btn btn-soft btn-full" href="/scan">Escanear QR / conectar spot para Reta</Link>
      <Link className="btn btn-soft btn-full" href="/retas">Ver retas activas</Link>
    </section>
  </AppShell>
}
