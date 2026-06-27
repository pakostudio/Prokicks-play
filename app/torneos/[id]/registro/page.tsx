'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, ShieldCheck, Trophy, UserRound, UsersRound } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { captureError } from '@/lib/monitoring';

type Participant = {
  name: string;
  age: string;
  whatsapp: string;
};

type RegistrationForm = {
  modality: 'individual' | 'dupla';
  branch: 'varonil' | 'femenil' | 'mixta' | 'libre';
  ageCategory: 'mayor_18' | 'menor_con_tutor';
  teamName: string;
  nickname: string;
  contactEmail: string;
  participant1: Participant;
  participant2: Participant;
  acceptedRules: boolean;
  acceptedImageRelease: boolean;
  guardianName: string;
  guardianWhatsapp: string;
  guardianEmail: string;
  guardianAccepted: boolean;
};

type Tournament = {
  id: string;
  title?: string | null;
  is_free?: boolean | null;
  cost?: number | null;
  currency?: string | null;
  payment_url?: string | null;
  starts_at?: string | null;
  venue?: string | null;
};

const initialForm: RegistrationForm = {
  modality: 'individual',
  branch: 'libre',
  ageCategory: 'mayor_18',
  teamName: '',
  nickname: '',
  contactEmail: '',
  participant1: { name: '', age: '', whatsapp: '' },
  participant2: { name: '', age: '', whatsapp: '' },
  acceptedRules: false,
  acceptedImageRelease: false,
  guardianName: '',
  guardianWhatsapp: '',
  guardianEmail: '',
  guardianAccepted: false,
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function normalizeWhatsapp(value: string) {
  const digits = digitsOnly(value);
  if (digits.length === 10) return `+52${digits}`;
  if (digits.length === 12 && digits.startsWith('52')) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith('521')) return `+${digits}`;
  return value.trim();
}

function isValidWhatsapp(value: string) {
  const digits = digitsOnly(value);
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('52')) || (digits.length === 13 && digits.startsWith('521'));
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidAge(value: string) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n < 100;
}

function money(cost?: number | null, currency = 'MXN') {
  const value = Number(cost || 0);
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(value);
}

export default function TournamentRegistration() {
  const params = useParams<{ id: string }>();
  const tournamentId = params.id;
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [message, setMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    trackEvent('Tournament Registration Started', {
      tournament_id: tournamentId,
    });

    if (!tournamentId || tournamentId.startsWith('demo-')) return;

    async function loadTournament() {
      try {
        const { data, error } = await supabase
          .from('prokicks_tournaments')
          .select('*')
          .eq('id', tournamentId)
          .maybeSingle();

        if (error) throw error;
        if (data) setTournament(data as Tournament);
      } catch (error) {
        captureError(error, { area: 'tournament-registration-select', tournamentId });
      }
    }

    loadTournament();
  }, [tournamentId]);

  const participants = useMemo(() => {
    const base = [form.participant1];
    if (form.modality === 'dupla') base.push(form.participant2);
    return base;
  }, [form.modality, form.participant1, form.participant2]);

  const hasMinor = useMemo(
    () => form.ageCategory === 'menor_con_tutor' || participants.some((p) => Number(p.age) > 0 && Number(p.age) < 18),
    [form.ageCategory, participants]
  );

  const isPaidTournament = Boolean(tournament && tournament.is_free === false && Number(tournament.cost || 0) > 0);
  const tournamentCost = Number(tournament?.cost || 0);
  const currency = tournament?.currency || 'MXN';

  const errors = useMemo(() => {
    const next: Record<string, string> = {};

    if (!form.participant1.name.trim()) next.participant1Name = 'Nombre obligatorio.';
    if (!form.participant1.age.trim()) next.participant1Age = 'Edad obligatoria.';
    else if (!isValidAge(form.participant1.age)) next.participant1Age = 'Edad inválida.';
    if (!form.participant1.whatsapp.trim()) next.participant1Whatsapp = 'WhatsApp obligatorio.';
    else if (!isValidWhatsapp(form.participant1.whatsapp)) next.participant1Whatsapp = 'WhatsApp inválido. Usa 10 dígitos o +52.';

    if (form.modality === 'dupla') {
      if (!form.participant2.name.trim()) next.participant2Name = 'Nombre del participante 2 obligatorio.';
      if (!form.participant2.age.trim()) next.participant2Age = 'Edad del participante 2 obligatoria.';
      else if (!isValidAge(form.participant2.age)) next.participant2Age = 'Edad del participante 2 inválida.';
      if (!form.participant2.whatsapp.trim()) next.participant2Whatsapp = 'WhatsApp del participante 2 obligatorio.';
      else if (!isValidWhatsapp(form.participant2.whatsapp)) next.participant2Whatsapp = 'WhatsApp del participante 2 inválido.';
    }

    if (!form.contactEmail.trim()) next.contactEmail = 'Correo obligatorio.';
    else if (!isValidEmail(form.contactEmail)) next.contactEmail = 'Correo inválido.';

    if (!form.acceptedRules) next.acceptedRules = 'Debes aceptar el reglamento.';
    if (!form.acceptedImageRelease) next.acceptedImageRelease = 'Debes autorizar uso de imagen para este evento.';

    if (hasMinor) {
      if (!form.guardianName.trim()) next.guardianName = 'Nombre del tutor obligatorio.';
      if (!form.guardianWhatsapp.trim()) next.guardianWhatsapp = 'WhatsApp del tutor obligatorio.';
      else if (!isValidWhatsapp(form.guardianWhatsapp)) next.guardianWhatsapp = 'WhatsApp del tutor inválido.';
      if (!form.guardianEmail.trim()) next.guardianEmail = 'Email del tutor obligatorio.';
      else if (!isValidEmail(form.guardianEmail)) next.guardianEmail = 'Email del tutor inválido.';
      if (!form.guardianAccepted) next.guardianAccepted = 'Debes confirmar autorización del tutor.';
    }

    return next;
  }, [form, hasMinor]);

  const canSubmit = Object.keys(errors).length === 0;

  function update<K extends keyof RegistrationForm>(key: K, value: RegistrationForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateParticipant(which: 'participant1' | 'participant2', key: keyof Participant, value: string) {
    setForm((prev) => ({
      ...prev,
      [which]: {
        ...prev[which],
        [key]: value,
      },
    }));
  }

  async function submit() {
    setMessage('');
    setEmailMessage('');
    if (!canSubmit) {
      setMessage('Revisa los campos marcados antes de confirmar.');
      trackEvent('Tournament Registration Error', {
        tournament_id: tournamentId,
        reason: 'validation',
        modality: form.modality,
      });
      return;
    }
    if (loading) return;
    setLoading(true);

    const cleanParticipants = participants.map((p, index) => ({
      number: index + 1,
      name: p.name.trim(),
      age: Number(p.age),
      whatsapp: normalizeWhatsapp(p.whatsapp),
    }));

    const paymentStatus = isPaidTournament ? 'pago_pendiente' : 'sin_costo';
    const registrationStatus = isPaidTournament ? 'pendiente' : 'confirmado';

    const payload = {
      tournament_id: tournamentId?.startsWith('demo-') ? null : tournamentId,
      user_id: null,
      participant_name: form.participant1.name.trim(),
      participant_email: form.contactEmail.trim().toLowerCase(),
      player_name: form.participant1.name.trim(),
      player_email: form.contactEmail.trim().toLowerCase(),
      nickname: form.nickname.trim() || null,
      team_name: form.teamName.trim() || null,
      modality: form.modality,
      branch: form.branch,
      age_category: hasMinor ? 'menor_con_tutor' : form.ageCategory,
      contact_email: form.contactEmail.trim().toLowerCase(),
      contact_whatsapp: normalizeWhatsapp(form.participant1.whatsapp),
      participant_1_name: form.participant1.name.trim(),
      participant_1_age: Number(form.participant1.age),
      participant_1_whatsapp: normalizeWhatsapp(form.participant1.whatsapp),
      participant_2_name: form.modality === 'dupla' ? form.participant2.name.trim() : null,
      participant_2_age: form.modality === 'dupla' ? Number(form.participant2.age) : null,
      participant_2_whatsapp: form.modality === 'dupla' ? normalizeWhatsapp(form.participant2.whatsapp) : null,
      participants: cleanParticipants,
      accepted_rules: form.acceptedRules,
      accepted_image_release: form.acceptedImageRelease,
      rules_version: 'prokicks-rules-v1',
      guardian_required: hasMinor,
      guardian_name: hasMinor ? form.guardianName.trim() : null,
      guardian_whatsapp: hasMinor ? normalizeWhatsapp(form.guardianWhatsapp) : null,
      guardian_email: hasMinor ? form.guardianEmail.trim().toLowerCase() : null,
      guardian_accepted: hasMinor ? form.guardianAccepted : false,
      registration_payload: {
        source: 'Registro a Torneos',
        modality: form.modality,
        branch: form.branch,
        ageCategory: hasMinor ? 'menor_con_tutor' : form.ageCategory,
        participants: cleanParticipants,
        acceptedRules: form.acceptedRules,
        acceptedImageRelease: form.acceptedImageRelease,
        guardianRequired: hasMinor,
        cost: tournamentCost,
        currency,
        paymentStatus,
      },
      notes: `Registro a Torneos · ${form.modality === 'dupla' ? 'Dupla' : 'Individual'} · ${form.branch} · ${hasMinor ? 'menor con tutor' : '18+'}`,
      status: registrationStatus,
      cost: tournamentCost,
      currency,
      payment_status: paymentStatus,
      registration_status: registrationStatus,
      payment_method: isPaidTournament ? 'pendiente_configurar' : 'sin_costo',
    };

    trackEvent('Tournament Registration Submitted', {
      tournament_id: tournamentId,
      modality: form.modality,
      branch: form.branch,
      paid: isPaidTournament,
    });

    const { error } = await supabase.from('prokicks_tournament_registrations').insert(payload);
    setLoading(false);

    if (error) {
      captureError(error, { area: 'tournament-registration-insert', tournamentId, modality: form.modality });
      trackEvent('Tournament Registration Error', {
        tournament_id: tournamentId,
        reason: 'supabase_insert',
        modality: form.modality,
      });
      setMessage(error.message);
      return;
    }

    const emailResponse = await fetch('/api/tournament-registration-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.contactEmail.trim().toLowerCase(),
        name: form.participant1.name.trim(),
        whatsapp: normalizeWhatsapp(form.participant1.whatsapp),
        tournamentTitle: tournament?.title || 'Torneo ProKicks',
        tournamentDate: tournament?.starts_at || null,
        venue: tournament?.venue || 'Por confirmar',
        modality: form.modality,
        branch: form.branch,
        ageCategory: hasMinor ? 'menor con tutor' : '18+',
        cost: tournamentCost,
        currency,
        paymentStatus,
        registrationStatus,
        participants: cleanParticipants,
        acceptedRules: form.acceptedRules,
        acceptedImageRelease: form.acceptedImageRelease,
        guardian: hasMinor ? {
          name: form.guardianName.trim(),
          whatsapp: normalizeWhatsapp(form.guardianWhatsapp),
          email: form.guardianEmail.trim().toLowerCase(),
          accepted: form.guardianAccepted,
        } : null,
      }),
    }).then((r) => r.json()).catch((error) => {
      captureError(error, { area: 'tournament-registration-email', tournamentId });
      return { ok: false };
    });

    setSubmitted(true);
    trackEvent('Tournament Registration Completed', {
      tournament_id: tournamentId,
      modality: form.modality,
      branch: form.branch,
      paid: isPaidTournament,
      email_sent: Boolean(emailResponse?.ok),
    });
    setMessage(isPaidTournament
      ? 'Tu pre-registro fue recibido. Te contactaremos para confirmar el pago.'
      : 'Registro recibido. Guardamos tu lugar y tus aceptaciones de reglamento e imagen.'
    );
    setEmailMessage(emailResponse?.ok ? 'También enviamos la confirmación por correo.' : 'Registro recibido. El correo de confirmación quedó pendiente.');
    setForm(initialForm);
  }

  const errorText = (key: keyof typeof errors) => errors[key] ? <p className="field-error">{errors[key]}</p> : null;

  if (submitted) {
    return (
      <AppShell active="torneos">
        <section className="hero section confirmation-hero">
          <div className="kicker">Registro a Torneos</div>
          <h1 className="h1">Registro recibido</h1>
          <p className="p">{message}</p>
          {emailMessage && <div className={emailMessage.includes('También') ? 'alert ok' : 'alert warn'}>{emailMessage}</div>}
          <div className="confirmation-actions">
            <Link className="btn btn-primary btn-full" href="/torneos">Volver a torneos</Link>
            <button className="btn btn-secondary btn-full" onClick={() => { setSubmitted(false); setMessage(''); setEmailMessage(''); }}>Hacer otro registro</button>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell active="torneos">
      <Link href={`/torneos/${tournamentId}`} className="back-link"><ChevronLeft size={18} /> Volver</Link>

      <section className="hero section">
        <div className="kicker">Registro a Torneos</div>
        <h1 className="h1">Aparta tu lugar</h1>
        <p className="p">Completa participantes, modalidad y consentimientos. {isPaidTournament ? 'Este torneo tiene costo.' : 'Primera etapa sin costo.'}</p>
      </section>

      <section className="card form section">
        <div className="card-head">
          <Trophy />
          <div>
            <h2>Datos del torneo</h2>
            <p>Selecciona cómo vas a participar.</p>
          </div>
        </div>

        {tournament && (
          <div className={isPaidTournament ? 'alert warn' : 'alert ok'}>
            {isPaidTournament ? `Costo de inscripción: ${money(tournamentCost, currency)}. El pago quedará pendiente de configuración.` : 'Registro sin costo.'}
          </div>
        )}

        <label className="field-label">Modalidad</label>
        <select className="input" value={form.modality} onChange={(e) => update('modality', e.target.value as RegistrationForm['modality'])}>
          <option value="individual">Individual / 1 jugador</option>
          <option value="dupla">Dupla / 2 jugadores</option>
        </select>

        <label className="field-label">Rama</label>
        <select className="input" value={form.branch} onChange={(e) => update('branch', e.target.value as RegistrationForm['branch'])}>
          <option value="varonil">Varonil</option>
          <option value="femenil">Femenil</option>
          <option value="mixta">Mixta</option>
          <option value="libre">Libre</option>
        </select>

        <label className="field-label">Categoría de edad</label>
        <select className="input" value={form.ageCategory} onChange={(e) => update('ageCategory', e.target.value as RegistrationForm['ageCategory'])}>
          <option value="mayor_18">Mayor 18+</option>
          <option value="menor_con_tutor">Menor con autorización de tutor</option>
        </select>

        {form.modality === 'dupla' && (
          <input className="input" placeholder="Nombre de dupla / equipo opcional" value={form.teamName} onChange={(e) => update('teamName', e.target.value)} />
        )}
      </section>

      <section className="card form section">
        <div className="card-head">
          <UserRound />
          <div>
            <h2>Participante 1</h2>
            <p>Datos principales para confirmar el registro.</p>
          </div>
        </div>
        <input className={errors.participant1Name ? 'input input-error' : 'input'} placeholder="Nombre completo" value={form.participant1.name} onChange={(e) => updateParticipant('participant1', 'name', e.target.value)} />
        {errorText('participant1Name')}
        <input className={errors.participant1Age ? 'input input-error' : 'input'} inputMode="numeric" placeholder="Edad" value={form.participant1.age} onChange={(e) => updateParticipant('participant1', 'age', e.target.value.replace(/[^0-9]/g, ''))} />
        {errorText('participant1Age')}
        <input className={errors.participant1Whatsapp ? 'input input-error' : 'input'} inputMode="tel" placeholder="WhatsApp · 10 dígitos" value={form.participant1.whatsapp} onChange={(e) => updateParticipant('participant1', 'whatsapp', e.target.value)} />
        {errorText('participant1Whatsapp')}
      </section>

      {form.modality === 'dupla' && (
        <section className="card form section">
          <div className="card-head">
            <UsersRound />
            <div>
              <h2>Participante 2</h2>
              <p>Solo aplica para modalidad dupla.</p>
            </div>
          </div>
          <input className={errors.participant2Name ? 'input input-error' : 'input'} placeholder="Nombre completo" value={form.participant2.name} onChange={(e) => updateParticipant('participant2', 'name', e.target.value)} />
          {errorText('participant2Name')}
          <input className={errors.participant2Age ? 'input input-error' : 'input'} inputMode="numeric" placeholder="Edad" value={form.participant2.age} onChange={(e) => updateParticipant('participant2', 'age', e.target.value.replace(/[^0-9]/g, ''))} />
          {errorText('participant2Age')}
          <input className={errors.participant2Whatsapp ? 'input input-error' : 'input'} inputMode="tel" placeholder="WhatsApp · 10 dígitos" value={form.participant2.whatsapp} onChange={(e) => updateParticipant('participant2', 'whatsapp', e.target.value)} />
          {errorText('participant2Whatsapp')}
        </section>
      )}

      <section className="card form section registro-section-final">
        <div className="card-head">
          <ShieldCheck />
          <div>
            <h2>Contacto y consentimientos</h2>
            <p>Estos datos se usarán para confirmar el torneo.</p>
          </div>
        </div>

        <input className={errors.contactEmail ? 'input input-error' : 'input'} type="email" placeholder="Correo de contacto" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
        {errorText('contactEmail')}
        <p className="helper-text helper-left">Usaremos el WhatsApp del participante 1 como contacto principal.</p>
        <input className="input" placeholder="Nickname ProKicks opcional" value={form.nickname} onChange={(e) => update('nickname', e.target.value)} />

        <label className={errors.acceptedRules ? 'check-row check-error' : 'check-row'}>
          <input type="checkbox" checked={form.acceptedRules} onChange={(e) => update('acceptedRules', e.target.checked)} />
          <span>
            Declaro que leí y acepto el Reglamento Oficial de Competencia ProKicks.
            <Link href="/legal/reglamento" className="inline-link" onClick={() => trackEvent('Rules Link Clicked', { tournament_id: tournamentId })}>Ver reglamento</Link>
          </span>
        </label>
        {errorText('acceptedRules')}
        <label className={errors.acceptedImageRelease ? 'check-row check-error' : 'check-row'}>
          <input type="checkbox" checked={form.acceptedImageRelease} onChange={(e) => update('acceptedImageRelease', e.target.checked)} />
          <span>
            Autorizo el uso de mi imagen para material del evento ProKicks.
            <Link href="/legal/uso-de-imagen" className="inline-link" onClick={() => trackEvent('Image Consent Link Clicked', { tournament_id: tournamentId })}>Ver autorización</Link>
          </span>
        </label>
        {errorText('acceptedImageRelease')}

        {hasMinor && <div className="alert warn">Detectamos categoría o edad de menor. Se requiere autorización de madre, padre o tutor.</div>}
        {hasMinor && (
          <div className="mini-stack">
            <input className={errors.guardianName ? 'input input-error' : 'input'} placeholder="Nombre del tutor" value={form.guardianName} onChange={(e) => update('guardianName', e.target.value)} />
            {errorText('guardianName')}
            <input className={errors.guardianWhatsapp ? 'input input-error' : 'input'} inputMode="tel" placeholder="WhatsApp del tutor · 10 dígitos" value={form.guardianWhatsapp} onChange={(e) => update('guardianWhatsapp', e.target.value)} />
            {errorText('guardianWhatsapp')}
            <input className={errors.guardianEmail ? 'input input-error' : 'input'} type="email" placeholder="Email del tutor" value={form.guardianEmail} onChange={(e) => update('guardianEmail', e.target.value)} />
            {errorText('guardianEmail')}
            <label className={errors.guardianAccepted ? 'check-row check-error' : 'check-row'}>
              <input type="checkbox" checked={form.guardianAccepted} onChange={(e) => update('guardianAccepted', e.target.checked)} />
              <span>Confirmo que cuento con autorización del tutor para participar.</span>
            </label>
            {errorText('guardianAccepted')}
          </div>
        )}

        {message && <div className={message.includes('recibido') || message.includes('Pre-registro') ? 'alert ok' : 'alert warn'}>{message}</div>}
        <button className="btn btn-primary btn-full" disabled={loading || !canSubmit} onClick={submit}>
          {loading ? 'Registrando...' : isPaidTournament ? 'Confirmar pre-registro' : 'Confirmar registro'}
        </button>
        {!canSubmit && <p className="helper-text">Completa todos los campos obligatorios y acepta reglamento/imagen para continuar.</p>}
      </section>
    </AppShell>
  );
}
