'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, AtSign, Eraser, FileSignature, MapPinCheck, QrCode, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { captureError } from '@/lib/monitoring';

const INSTAGRAM_URL = 'https://www.instagram.com/prokicksoficial?igsh=MTQyZDgwcTUwcTdxOQ==';
const RULES_VERSION = 'prokicks-rules-v1';

type Registration = {
  id: string;
  tournament_id: string;
  participant_1_name: string | null;
  contact_email: string | null;
  check_in_status: string | null;
  check_in_code: string | null;
  ig_followed: boolean | null;
  signed_at: string | null;
};

function getPoint(canvas: HTMLCanvasElement, event: ReactPointerEvent<HTMLCanvasElement>) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

export default function TournamentCheckIn() {
  const params = useParams<{ id: string }>();
  const tournamentId = params.id;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const hasStrokeRef = useRef(false);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [igConfirmed, setIgConfirmed] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signed, setSigned] = useState(false);
  const [saving, setSaving] = useState(false);
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

  function setupCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111827';
  }

  useEffect(() => {
    if (registration && !signed) setupCanvas();
  }, [registration, signed]);

  async function findRegistration() {
    setLookupError('');
    setRegistration(null);
    setCheckedIn(false);
    setIgConfirmed(false);
    setSigned(false);
    setHasSignature(false);

    if (!email.trim()) {
      setLookupError('Escribe el correo con el que te registraste.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prokicks_tournament_registrations')
        .select('id, tournament_id, participant_1_name, contact_email, check_in_status, check_in_code, ig_followed, signed_at')
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

      const reg = data as Registration;
      setRegistration(reg);
      setIgConfirmed(Boolean(reg.ig_followed));
      setSigned(Boolean(reg.signed_at));
      setCheckedIn(reg.check_in_status === 'checked_in');
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

  function startDraw(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawingRef.current = true;
    hasStrokeRef.current = true;
    const { x, y } = getPoint(canvas, event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPoint(canvas, event);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  }

  function endDraw() {
    drawingRef.current = false;
  }

  function clearSignature() {
    setupCanvas();
    setHasSignature(false);
    hasStrokeRef.current = false;
  }

  async function saveSignature() {
    if (!registration || !canvasRef.current || saving) return;
    if (!hasStrokeRef.current) {
      setLookupError('Dibuja tu firma antes de continuar.');
      return;
    }

    setSaving(true);
    setLookupError('');
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const { error } = await supabase
        .from('prokicks_tournament_registrations')
        .update({
          signature_data_url: dataUrl,
          signed_at: new Date().toISOString(),
          accepted_rules: true,
          rules_version: RULES_VERSION,
        })
        .eq('id', registration.id);

      if (error) throw error;

      setSigned(true);
      trackEvent('Tournament Signature Saved', { tournament_id: tournamentId, registration_id: registration.id });
    } catch (error) {
      captureError(error, { area: 'tournament-signature-save', tournamentId });
      setLookupError('No pudimos guardar tu firma. Intenta de nuevo.');
    } finally {
      setSaving(false);
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

  const qrValue = registration?.check_in_code || registration?.id || '';
  const qrUrl = qrValue ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(qrValue)}` : '';

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
          <Link href={`/torneos/${tournamentId}/registro`} className="inline-link">¿Aún no te registras? Inscríbete aquí</Link>
        </section>
      )}

      {registration && !checkedIn && (
        <>
          <section className="card section">
            <div className="row">
              <MapPinCheck color="#173B63" />
              <div>
                <h3 className="card-title">Hola, {registration.participant_1_name || 'jugador'}</h3>
                <p className="p">Sigue estos 3 pasos para completar tu check-in.</p>
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

          <section className="card form section">
            <div className="card-head">
              <FileSignature />
              <div>
                <h2>Paso 2 · Firma tu responsiva</h2>
                <p>Declaro que leí y acepto el Reglamento Oficial de Competencia ProKicks y autorizo mi participación bajo estos términos.</p>
              </div>
            </div>

            {!signed ? (
              <>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={220}
                  className="signature-canvas"
                  onPointerDown={startDraw}
                  onPointerMove={draw}
                  onPointerUp={endDraw}
                  onPointerLeave={endDraw}
                />
                <div className="grid-2">
                  <button className="btn btn-soft" onClick={clearSignature}><Eraser size={16} /> Borrar</button>
                  <button className="btn btn-primary" disabled={saving || !hasSignature} onClick={saveSignature}>
                    {saving ? 'Guardando...' : 'Guardar firma'}
                  </button>
                </div>
                <Link href="/legal/reglamento" className="inline-link">Ver reglamento completo</Link>
              </>
            ) : (
              <div className="alert ok">Firma guardada. Ya puedes continuar al paso 3.</div>
            )}
          </section>

          <section className="card section">
            <div className="card-head">
              <ShieldCheck />
              <div>
                <h2>Paso 3 · Confirma tu llegada</h2>
                <p>{signed ? 'Este botón registra tu check-in en el torneo, hoy mismo.' : 'Primero firma tu responsiva en el paso 2.'}</p>
              </div>
            </div>
            <button className="btn btn-primary btn-full" disabled={checkingIn || !signed} onClick={doCheckIn}>
              {checkingIn ? 'Registrando...' : 'Ya estoy aquí'}
            </button>
            {lookupError && <div className="alert warn">{lookupError}</div>}
          </section>
        </>
      )}

      {registration && checkedIn && (
        <section className="card section confirmation-hero">
          <div className="alert ok">¡Check-in confirmado! Ya estás dentro del torneo.</div>
          {qrUrl && (
            <div className="card" style={{ textAlign: 'center', marginTop: 16 }}>
              <div className="row" style={{ justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                <QrCode size={18} color="#173B63" />
                <strong>Tu código de acceso</strong>
              </div>
              <img src={qrUrl} alt="Código QR de check-in" style={{ width: 180, height: 180, margin: '0 auto', borderRadius: 12 }} />
              <p className="p" style={{ marginTop: 8 }}>Muéstralo en la mesa de staff si te lo piden. También queda ligado a tu registro.</p>
            </div>
          )}
          <Link className="btn btn-soft btn-full section" href={`/torneos/${tournamentId}`}>Volver al torneo</Link>
        </section>
      )}
    </AppShell>
  );
}
