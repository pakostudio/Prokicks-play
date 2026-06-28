import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { demoSpots } from '@/lib/demo';

export default function SpotsPage(){
  return <AppShell active="map">
    <section className="section">
      <div className="kicker">Spots</div><h1 className="h1">Encuentra spots para echar la reta</h1>
      <div className="mini-map"><span className="pin p1"></span><span className="pin p2"></span><span className="pin p3"></span></div>
    </section>
    <section className="list section">
      {demoSpots.map(s=><article className="card spot-card" key={s.id}>
        <div className="map-preview"><span className="pin p1"></span></div>
        <div className="row"><h3 className="card-title">{s.name}</h3><span className="tag tag-blue">{s.status}</span></div>
        <p className="field-label">Ubicación del spot</p>
        <p className="p">{s.address}</p>
        <p className="p">Código: {s.code} · actividad {s.activity_score}</p>
        <div className="grid-2">
          <Link className="btn btn-soft" href={`/spots/${s.id}`}>Ver spot</Link>
          <Link className="btn btn-warm" href={s.maps_url} target="_blank">Abrir en Google Maps</Link>
        </div>
      </article>)}
    </section>
  </AppShell>
}
