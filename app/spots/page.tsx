import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { mapEmbedUrl, realSpots } from '@/lib/demo';

export default function SpotsPage(){
  return <AppShell active="map">
    <section className="section">
      <div className="kicker">Spots</div><h1 className="h1">Encuentra spots para echar la reta</h1>
      <div className="mini-map"><span className="pin p1"></span><span className="pin p2"></span><span className="pin p3"></span></div>
    </section>
    <section className="list section">
      {realSpots.map(s=><article className="card spot-card" key={s.id}>
        <iframe className="map-embed" src={mapEmbedUrl(s.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Mapa ${s.name}`} />
        <div className="row"><h3 className="card-title">{s.name}</h3><span className="tag tag-blue">{s.status}</span></div>
        <p className="field-label">Ubicación del spot</p>
        <p className="p">{s.address}</p>
        <p className="p">Código: {s.code}</p>
        <div className="grid-2">
          <Link className="btn btn-soft" href={`/spots/${s.id}`}>Ver spot</Link>
          <Link className="btn btn-warm" href={s.maps_url} target="_blank">Abrir en Google Maps</Link>
        </div>
      </article>)}
    </section>
  </AppShell>
}
