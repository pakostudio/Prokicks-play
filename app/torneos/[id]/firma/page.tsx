'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, Eraser, FileSignature, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { captureError } from '@/lib/monitoring';

const RULES_VERSION = 'prokicks-rules-v1';

type Registration = {
  id: string;
  tournament_id: string;
  participant_1_name: string | null;
  contact_email: string | null;
  signed_at: string | null;
};

function getPoint(canvas: HTMLCanvasElement, event: React.PointerEvent<HTMLCanvasElement>) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

export default function TournamentSignature() {
  const params = useParams<{ id: string }>();
  const tournamentId = params.id;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const hasStrokeRef = useRef(false);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    trackEvent('Tournament Signature Viewed', { tournament_id: tournamentId });
    try {
      const raw = window.localStorage.getItem('prokicks_last_tournament_registration');
      if (raw) {
        const savedReg = JSON.parse(raw);
        if (savedReg?.tournament_id === tournamentId && savedReg?.contact_email) {
          setEmail(savedReg.contact_email);
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
    if (registration) setupCanvas();
  }, [registration]);

  async function findRegistration() {
    setLookupError('');
    setRegistration(null);
    setSaved(false);
    setHasSignature(false);

    if (!email.trim()) {
      setLookupError('Escribe el correo con el que te registraste.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prokicks_tournament_registrations')
        .select('id, tournament_id, participant_1_name, contact_email, signed_at')
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
      setSaved(Boolean((data as Registration).signed_at));
    } catch (error) {
      captureError(error, { area: 'tournament-signature-lookup', tournamentId });
      setLookupError('No pudimos buscar tu registro. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  function startDraw(event: React.PointerEvent<HTMLCanvasElement>) {
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

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
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
      setLookupError('Dibuja tu firma antes de guardar.');
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

      setSaved(true);
      trackEvent('Tournament Signature Saved', { tournament_id: tournamentId, registration_id: registration.id });
    } catch (error) {
      captureError(error, { area: 'tournament-signature-save', tournamentId });
      setLookupError('No pudimos guardar tu firma. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell active="torneos">
      <Link href={`/torneos/${tournamentId}`} className="back-link"><ChevronLeft size={18} /> Volver</Link>

      <section className="hero section">
        <div className="kicker">Responsiva del torneo</div>
        <h1 className="h1">Firma tu responsiva</h1>
        <p className="p">Firma con el dedo o el mouse, igual que cuando le firmas en el celular a alguien. Tu firma queda ligada a tu registro.</p>
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

      {registration && !saved && (
        <section className="card form section">
          <div className="card-head">
            <FileSignature />
            <div>
              <h2>Hola, {registration.participant_1_name || 'jugador'}</h2>
              <p>Declaro que leí y acepto el Reglamento Oficial de Competencia ProKicks y autorizo mi participación bajo estos términos.</p>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={600}
            height={260}
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
          {lookupError && <div className="alert warn">{lookupError}</div>}
          <Link href="/legal/reglamento" className="inline-link">Ver reglamento completo</Link>
        </section>
      )}

      {registration && saved && (
        <section className="card section confirmation-hero">
          <div className="alert ok">Tu responsiva quedó firmada y guardada.</div>
          <Link className="btn btn-soft btn-full section" href={`/torneos/${tournamentId}`}>Volver al torneo</Link>
        </section>
      )}
    </AppShell>
  );
}
