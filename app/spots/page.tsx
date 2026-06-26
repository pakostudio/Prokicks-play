import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { demoSpots } from '@/lib/demo';

export default function SpotsPage(){
  return <AppShell active="map">
    <section className="section">
      <div className="kicker">Spots</div><h1 className="h1">Mapa de juego</h1>
      <div className="mini-map"><span className="pin p1"></span><span className="pin p2"></span><span className="pin p3"></span></div>
    </section>
    <section className="list section">
      {demoSpots.map(s=><Link className="card" href={`/spots/${s.id}`} key={s.id}>
        <div className="row"><h3 className="card-title">{s.name}</h3><span className="tag tag-blue">{s.status}</span></div>
        <p className="p">{s.address} · actividad {s.activity_score}</p>
      </Link>)}
    </section>
  </AppShell>
}
