'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, AtSign, MapPinCheck, ShieldCheck, Award } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { captureError } from '@/lib/monitoring';
import { downloadTournamentCertificate } from '@/lib/certificate';

const INSTAGRAM_URL = 'https://www.instagram.com/prokicksoficial?igsh=MTQyZDgwcTUwcTdxOQ==';

type Registration = {
  id: string;
  tournament_id: string;
  participant_1_name: string | null;
  participant_2_name: string | null;
  contact_email: string | null;
  check_in_status: string | null;
  ig_followed: boolean | null;
};

type TournamentInfo = {
  title: string | null;
  venue: string | null;
  starts_at: string | null;
};

export default function TournamentCheckIn() {
  const params = useParams<{ id: string }>();
  const tournamentId = params.id;

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [candidates, setCandidates] = useState<Registration[]>([]);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [igConfirmed, setIgConfirmed] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [tournament, setTournament] = useState<TournamentInfo | null>(null);
  const [downloadingCert, setDownloadingCert] = useState(false);

  useEffect(() => {
    trackEvent('Tournament CheckIn Viewed', { tournament_id: tournamentId });

    try {
      const raw = window.localStorage.getItem('prokicks_last_tournament_registration');
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.tournament_id === tournamentId && saved?.participant_1_name) {
          setName(saved.participant_1_name);
        }
      }
    } catch {
      // ignore
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from('prokicks_tournaments')
          .select('title, venue, starts_at')
          .eq('id', tournamentId)
          .maybeSingle();
        if (error) throw error;
        if (data) setTournament(data as TournamentInfo);
      } catch (error) {
        captureError(error, { area: 'tournament-checkin-tournament-info', tournamentId });
      }
    })();
  }, [tournamentId]);

  function pickCandidate(candidate: Registration) {
    setCandidates([]);
    setRegistration(candidate);
    setIgConfirmed(Boolean(candidate.ig_followed));
    setCheckedIn(candidate.check_in_status === 'checked_in');
  }

  async function findRegistration() {
    setLookupError('');
    setRegistration(null);
    setCandidates([]);
    setCheckedIn(false);
    setIgConfirmed(false);

    const cleanName = name.trim();
    if (!cleanName) {
      setLookupError('Escribe tu nombre y apellido.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prokicks_tournament_registrations')
        .select('id, tournament_id, participant_1_name, participant_2_name, contact_email, check_in_status, ig_followed')
        .eq('tournament_id', tournamentId)
        .or(`participant1_name.ilike.%${cleanName}%,participant2_name.ilike.%${cleanName}%`)
        .limit(10);

      if (error) throw error;

      const results = (data || []) as Registration[];
      if (results.length === 0) {
        setLookupError('No encontramos tu registro. Revisa que escribiste tu nombre igual que en tu inscripción.');
        return;
      }
      if (results.length === 1) {
        pickCandidate(results[0]);
        return;
      }
      setCandidates(results);
      setLookupError(`Encontramos ${results.length} coincidencias. Toca la tuya (si hace falta, escribe tu nombre con los dos apellidos).`);
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

  async function handleDownloadCertificate() {
    if (!registration || downloadingCert) return;
    setDownloadingCert(true);
    try {
      const dateLabel = tournament?.starts_at
        ? new Date(tournament.starts_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;
      await downloadTournamentCertificate({
        participantName: registration.participant_1_name || 'Participante',
        tournamentTitle: tournament?.title || 'Torneo ProKicks',
        venue: tournament?.venue,
        dateLabel,
      });
      trackEvent('Tournament Certificate Downloaded', { tournament_id: tournamentId, registration_id: registration.id });
    } catch (error) {
      captureError(error, { area: 'tournament-checkin-certificate', tournamentId });
    } finally {
      setDownloadingCert(false);
    }
  }

  return (
    <AppShell active="torneos">
      <Link href={`/torneos/${tournamentId}`} className="back-link"><ChevronLeft size={18} /> Volver</Link>

      <section className="hero section">
        <div className="kicker">Check-in del torneo</div>
        <h1 className="h1">Confirma tu llegada</h1>
        <p className="p">Hazlo desde tu propio celular, sin filas ni tablet del admin. Solo necesitas tu nombre y apellido.</p>
      </section>

      {!registration && (
        <section className="card form section">
          <div className="card-head">
            <ShieldCheck />
            <div>
              <h2>Busca tu registro</h2>
              <p>Escribe tu nombre igual que en tu inscripción al torneo.</p>
            </div>
          </div>
          <input
            className="input"
            placeholder="Nombre y apellido"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && findRegistration()}
          />
          {lookupError && <div className="alert warn">{lookupError}</div>}
          <button className="btn btn-primary btn-full" disabled={loading} onClick={findRegistration}>
            {loading ? 'Buscando...' : 'Buscar mi registro'}
          </button>
        </section>
      )}

      {candidates.length > 0 && (
        <section className="card form section">
          {candidates.map((candidate) => (
            <button key={candidate.id} className="btn btn-soft btn-full checkin-candidate" onClick={() => pickCandidate(candidate)}>
              <strong>{candidate.participant_1_name || 'Participante'}</strong>
              {candidate.participant_2_name ? ` · ${candidate.participant_2_name}` : ''}
            </button>
          ))}
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
          <button className="btn btn-warm btn-full section" disabled={downloadingCert} onClick={handleDownloadCertificate}>
            <Award size={16} /> {downloadingCert ? 'Generando...' : 'Descargar mi reconocimiento'}
          </button>
          <Link className="btn btn-soft btn-full section" href={`/torneos/${tournamentId}`}>Volver al torneo</Link>
        </section>
      )}
    </AppShell>
  );
}
