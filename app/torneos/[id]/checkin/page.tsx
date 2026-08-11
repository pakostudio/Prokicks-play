'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, AtSign, MapPinCheck, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { captureError } from '@/lib/monitoring';

const INSTAGRAM_URL = 'https://www.instagram.com/prokicksoficial?igsh=MTQyZDgwcTUwcTdxOQ==';

type Registration = {
  id: string;
  tournament_id: string;
  participant_1_name: string | null;
  contact_email: string | null;
  check_in_status: string | null;
  ig_followed: boolean | null;
};

export default function TournamentCheckIn() {
  const params = useParams<{ id: string }>();
  const tournamentId = params.id;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [igConfirmed, setIgConfirmed] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    trackEvent('Tournament CheckIn Viewed', { tournament_id: tournamentId });

    try {
      const raw = window.localStorage.getItem('prokicks_last_tournament_registration');
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.tournament_id === tournamentId && saved?.contact_email) {
          setEmail(saved.contact_email);
        }
      }
    } catch {
      // ignore
    }
  }, [tournamentId]);

  async function findRegistration() {
    setLookupError('');
    setRegistration(null);
    setCheckedIn(false);
    setIgConfirmed(false);

    if (!email.trim()) {
      setLookupError('Escribe el correo con el que te registraste.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prokicks_tournament_registrations')
        .select('id, tournament_id, participant_1_name, contact_email, check_in_status, ig_followed')
        .eq('tournament_id', tournamentId)
        .eq('contact_email', email.trim().toLowerCase())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setLookupError('No encontramos un registro con ese correo para este torneo.');
        return;
      }

      setRegistration(data as Registration);
      setIgConfirmed(Boolean((data as Registration).ig_followed));
      setCheckedIn((data as Registration).check_in_status === 'checked_in');
    } catch (error) {
      captureError(error, { area: 'tournament-checkin-lookup', tournamentId });
      setLookupError('No pudimos buscar tu registro. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function confirmIgFollow() {
    if (!registration) return;
    setIgConfirmed(true);
    try {
      await supabase
        .from('prokicks_tournament_registrations')
        .update({ ig_followed: true, ig_followed_at: new Date().toISOString() })
        .eq('id', registration.id);
      trackEvent('Tournament CheckIn IG Confirmed', { tournament_id: tournamentId, registration_id: registration.id });
    } catch (error) {
      captureError(error, { area: 'tournament-checkin-ig', tournamentId });
    }
  }

  async function doCheckIn() {
    if (!registration || checkingIn) return;
    setCheckingIn(true);
    try {
      const { error } = await supabase
        .from('prokicks_tournament_registrations')
        .update({
          check_in_status: 'checked_in',
          check_in_at: new Date().toISOString(),
          checked_in_by: 'self',
        })
        .eq('id', registration.id);

      if (error) throw error;

      setCheckedIn(true);
      trackEvent('Tournament CheckIn Completed', { tournament_id: tournamentId, registration_id: registration.id });
    } catch (error) {
      captureError(error, { area: 'tournament-checkin-submit', tournamentId });
      setLookupError('No pudimos registrar tu check-in. Intenta de nuevo.');
    } finally {
      setCheckingIn(false);
    }
  }

  return (
    <AppShell active="torneos">
      <Link href={`/torneos/${tournamentId}`} className="back-link"><ChevronLeft size={18} /> Volver</Link>

      <section className="hero section">
        <div className="kicker">Check-in del torneo</div>
        <h1 className="h1">Confirma tu llegada</h1>
        <p className="p">Hazlo desde tu propio celular, sin filas ni tablet del admin. Solo necesitas el correo con el que te registraste.</p>
      </section>

      {!registration && (
        <section className="card form section">
          <div className="card-head">
            <ShieldCheck />
            <div>
              <h2>Busca tu registro</h2>
              <p>Usa el mismo correo de tu inscripción al torneo.</p>
            </div>
          </div>
          <input
            className="input"
            type="email"
            placeholder="Correo de contacto"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {lookupError && <div className="alert warn">{lookupError}</div>}
          <button className="btn btn-primary btn-full" disabled={loading} onClick={findRegistration}>
            {loading ? 'Buscando...' : 'Buscar mi registro'}
          </button>
        </section>
      )}

      {registration && !checkedIn && (
        <>
          <section className="card section">
            <div className="row">
              <MapPinCheck color="#173B63" />
              <div>
                <h3 className="card-title">Hola, {registration.participant_1_name || 'jugador'}</h3>
                <p className="p">Sigue estos 2 pasos para completar tu check-in.</p>
              </div>
            </div>
          </section>

          <section className="card section">
            <div className="card-head">
              <AtSign />
              <div>
                <h2>Paso 1 · Síguenos en Instagram</h2>
                <p>Apoya a la comunidad ProKicks siguiéndonos @prokicksoficial.</p>
              </div>
            </div>
            <a className="btn btn-warm btn-full" href={INSTAGRAM_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('Tournament CheckIn IG Clicked', { tournament_id: tournamentId })}>
              <AtSign size={16} /> Abrir Instagram
            </a>
            <label className="check-row">
              <input type="checkbox" checked={igConfirmed} onChange={(e) => (e.target.checked ? confirmIgFollow() : setIgConfirmed(false))} />
              <span>Ya sigo a @prokicksoficial en Instagram.</span>
            </label>
          </section>

          <section className="card section">
            <div className="card-head">
              <ShieldCheck />
              <div>
                <h2>Paso 2 · Confirma tu llegada</h2>
                <p>Este botón registra tu check-in en el torneo, hoy mismo.</p>
              </div>
            </div>
            <button className="btn btn-primary btn-full" disabled={checkingIn} onClick={doCheckIn}>
              {checkingIn ? 'Registrando...' : 'Ya estoy aquí'}
            </button>
          </section>
        </>
      )}

      {registration && checkedIn && (
        <section className="card section confirmation-hero">
          <div className="alert ok">¡Check-in confirmado! Ya estás dentro del torneo.</div>
          <Link className="btn btn-soft btn-full section" href={`/torneos/${tournamentId}`}>Volver al torneo</Link>
        </section>
      )}
    </AppShell>
  );
}
