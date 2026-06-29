'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CalendarDays, MapPin, Trophy, Users } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { captureError } from '@/lib/monitoring';
import { indoorTournament, mapEmbedUrl } from '@/lib/demo';

type Tournament = {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  state: string | null;
  format: string | null;
  level: string | null;
  status: string | null;
  starts_at: string | null;
  capacity: number | null;
  is_free: boolean | null;
  cost?: number | null;
  currency?: string | null;
  payment_url?: string | null;
  rules: string | null;
  venue?: string | null;
  address?: string | null;
  maps_url?: string | null;
  flyer_url?: string | null;
  pdf_url?: string | null;
};

const fallbackTournament: Tournament = {
  ...indoorTournament,
  payment_url: null,
  rules: 'Registro sin costo. Cupo limitado. Modalidad individual, dupla y menor con tutor disponibles.',
};

function costLabel(t: Tournament) {
  if (t.is_free !== false || !Number(t.cost || 0)) return 'Sin costo';

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: t.currency || 'MXN',
  }).format(Number(t.cost || 0));
}

export default function TournamentDetail() {
  const params = useParams<{ id: string }>();
  const tournamentId = params.id;
  const [item, setItem] = useState<Tournament>({
    ...fallbackTournament,
    id: tournamentId || fallbackTournament.id,
  });
  const [flyerOpen, setFlyerOpen] = useState(false);

  useEffect(() => {
    trackEvent('Tournament Viewed', { tournament_id: tournamentId });

    async function loadTournament() {
      if (!tournamentId || tournamentId === indoorTournament.id) return;

      try {
        const { data, error } = await supabase
          .from('prokicks_tournaments')
          .select('*')
          .eq('id', tournamentId)
          .maybeSingle();

        if (error) throw error;
        if (data) setItem(data as Tournament);
      } catch (error) {
        captureError(error, {
          area: 'tournament-detail-select',
          tournamentId,
        });
      }
    }

    loadTournament();
  }, [tournamentId]);

  const isPaid = item.is_free === false && Number(item.cost || 0) > 0;

  return (
    <AppShell active="torneos">
      <section className="hero section tournament-hero">
        <div className="kicker">Torneo · {costLabel(item)}</div>
        <h1 className="h1">{item.title}</h1>
        <p className="p">{item.description}</p>
        {item.flyer_url && (
          <button className="flyer-button" onClick={() => setFlyerOpen(true)}>
            <img className="tournament-flyer" src={item.flyer_url} alt={`Flyer ${item.title}`} onError={(event) => { event.currentTarget.style.display = 'none'; }} />
          </button>
        )}

        {isPaid && (
          <div className="alert warn section">
            Costo de inscripción: {costLabel(item)}. El pago real se activará en una siguiente etapa.
          </div>
        )}

        <Link
          href={`/torneos/${item.id}/registro`}
          className="btn btn-primary btn-full section"
          onClick={() =>
            trackEvent(isPaid ? 'Purchase CTA Clicked' : 'Tournament Registration Started', {
              tournament_id: item.id,
              paid: isPaid,
            })
          }
        >
          Registrarme al torneo
        </Link>
        {item.pdf_url && <Link className="btn btn-soft btn-full" href={item.pdf_url} target="_blank">Abrir PDF del torneo</Link>}
      </section>

      {flyerOpen && item.flyer_url && (
        <div className="modal-backdrop" onClick={() => setFlyerOpen(false)}>
          <button className="modal-close" onClick={() => setFlyerOpen(false)}>Cerrar</button>
          <img className="modal-flyer" src={item.flyer_url} alt={`Flyer ${item.title}`} onError={(event) => { event.currentTarget.style.display = 'none'; }} />
        </div>
      )}

      <section className="grid section detail-grid-safe">
        <div className="card spot-card">
          <iframe className="map-embed" src={mapEmbedUrl(item.address || indoorTournament.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Mapa ${item.venue || 'Indoor Community'}`} />
          <div className="row">
            <MapPin color="#173B63" />
            <div>
              <h3 className="card-title">Ubicación del spot</h3>
              <p className="p">
                {item.venue || 'Indoor Community'}<br />{item.address || `${item.city || 'CDMX'} · ${item.state || 'Ciudad de México'}`}
              </p>
              {item.maps_url && <Link className="inline-link" href={item.maps_url} target="_blank">Abrir en Google Maps</Link>}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="row">
            <CalendarDays color="#173B63" />
            <div>
              <h3 className="card-title">Fecha</h3>
              <p className="p">
                {item.starts_at ? new Date(item.starts_at).toLocaleDateString('es-MX') : 'Por confirmar'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="row">
            <Trophy color="#173B63" />
            <div>
              <h3 className="card-title">Formato</h3>
              <p className="p">
                {item.format || 'Formato abierto'} · {item.level || 'abierto'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="row">
            <Users color="#173B63" />
            <div>
              <h3 className="card-title">Cupo</h3>
              <p className="p">{item.capacity || 'Por definir'} lugares</p>
            </div>
          </div>
        </div>
      </section>

      {item.rules && (
        <section className="card section detail-bottom-safe">
          <h2 className="card-title">Reglas</h2>
          <p className="p">{item.rules}</p>
          <Link
            href="/legal/reglamento"
            className="inline-link"
            onClick={() => trackEvent('Rules Link Clicked', { tournament_id: item.id })}
          >
            Ver reglamento completo
          </Link>
        </section>
      )}
    </AppShell>
  );
}
