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
  address?: string | null;
  maps_url?: string | null;
  active?: boolean | null;
  status?: string;
};

const fallbackSpots = realSpots.map((spot) => ({ ...spot, active: true }));

function mapsSearchUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function normalizeSpot(spot: Partial<Spot>, index: number): Spot | null {
  const address = String(spot.address || '').trim();
  const name = String(spot.name || '').trim();
  const code = String(spot.code || '').trim();

  if (!name || !code || !address) return null;

  return {
    id: String(spot.id || code || `spot-${index}`),
    name,
    code,
    city: spot.city || 'CDMX',
    state: spot.state || 'Ciudad de México',
    address,
    maps_url: String(spot.maps_url || '').trim() || mapsSearchUrl(address),
    active: spot.active !== false,
    status: spot.active === false ? 'Inactivo' : 'Activo',
  };
}

export default function SpotsPage() {
  const [items, setItems] = useState<Spot[]>(fallbackSpots);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('prokicks_spots')
          .select('id,name,code,address,city,state,maps_url,active')
          .eq('active', true)
          .order('name', { ascending: true });

        if (error) {
          captureError(error, { area: 'public-spots-select' });
          return;
        }

        const clean = (data || [])
          .map((spot, index) => normalizeSpot(spot as Spot, index))
          .filter(Boolean) as Spot[];

        if (clean.length) setItems(clean);
      } catch (error) {
        captureError(error, { area: 'public-spots-load' });
      }
    }

    load();
  }, []);

  return (
    <AppShell active="map">
      <section className="section">
        <div className="kicker">Spots</div>
        <h1 className="h1">Encuentra spots para echar la reta</h1>
        <div className="mini-map">
          <span className="pin p1"></span>
          <span className="pin p2"></span>
          <span className="pin p3"></span>
        </div>
      </section>

      <section className="list section">
        {items.map((raw, index) => {
          const s = normalizeSpot(raw, index);
          if (!s) return null;

          return (
            <article className="card spot-card" key={s.id}>
              <iframe
                className="map-embed"
                src={mapEmbedUrl(s.address || s.name)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Mapa ${s.name}`}
              />
              <div className="row">
                <h3 className="card-title">{s.name}</h3>
                <span className="tag tag-blue">Activo</span>
              </div>
              <p className="field-label">Ubicación del spot</p>
              <p className="p">{s.address}</p>
              <p className="p">Código: {s.code}</p>
              <div className="grid-2">
                <Link className="btn btn-soft" href={`/spots/${s.id}`}>
                  Ver spot
                </Link>
                <Link
                  className="btn btn-warm"
                  href={s.maps_url || mapsSearchUrl(s.address || s.name)}
                  target="_blank"
                >
                  Abrir en Google Maps
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
