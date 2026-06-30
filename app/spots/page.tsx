'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { mapEmbedUrl, realSpots } from '@/lib/demo';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/monitoring';

type Spot = {
  id: string;
  name: string;
  code: string;
  city?: string | null;
  state?: string | null;
  address: string;
  maps_url: string;
  active?: boolean | null;
  status?: string;
};

const fallbackSpots = realSpots.map((spot) => ({ ...spot, active: true }));

export default function SpotsPage() {
  const [items, setItems] = useState<Spot[]>(fallbackSpots);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('prokicks_spots')
        .select('id,name,code,address,city,state,maps_url,active')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) {
        captureError(error, { area: 'public-spots-select' });
        return;
      }

      if (data?.length) setItems(data as Spot[]);
    }

    load();
  }, []);

  return (
    <AppShell active="map">
      <section className="section">
        <div className="kicker">Spots</div><h1 className="h1">Encuentra spots para echar la reta</h1>
        <div className="mini-map"><span className="pin p1"></span><span className="pin p2"></span><span className="pin p3"></span></div>
      </section>
      <section className="list section">
        {items.map((s) => (
          <article className="card spot-card" key={s.id}>
            <iframe className="map-embed" src={mapEmbedUrl(s.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Mapa ${s.name}`} />
            <div className="row"><h3 className="card-title">{s.name}</h3><span className="tag tag-blue">{s.active === false ? 'Inactivo' : 'Activo'}</span></div>
            <p className="field-label">Ubicación del spot</p>
            <p className="p">{s.address}</p>
            <p className="p">Código: {s.code}</p>
            <div className="grid-2">
              <Link className="btn btn-soft" href={`/spots/${s.id}`}>Ver spot</Link>
              <Link className="btn btn-warm" href={s.maps_url} target="_blank">Abrir en Google Maps</Link>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
