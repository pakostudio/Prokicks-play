'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const states: Record<string, string[]> = {
  'Ciudad de México': [
    'Álvaro Obregón', 'Azcapotzalco', 'Benito Juárez', 'Coyoacán', 'Cuajimalpa', 'Cuauhtémoc',
    'Gustavo A. Madero', 'Iztacalco', 'Iztapalapa', 'Magdalena Contreras', 'Miguel Hidalgo',
    'Milpa Alta', 'Tláhuac', 'Tlalpan', 'Venustiano Carranza', 'Xochimilco'
  ],
  'Estado de México': ['Naucalpan', 'Tlalnepantla', 'Huixquilucan', 'Atizapán', 'Ecatepec', 'Toluca', 'Metepec'],
  'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Puerto Vallarta'],
  'Nuevo León': ['Monterrey', 'San Pedro Garza García', 'San Nicolás', 'Guadalupe', 'Apodaca'],
  'Puebla': ['Puebla', 'San Andrés Cholula', 'San Pedro Cholula', 'Atlixco']
};

const avatarOptions = ['PK Azul', 'PK Naranja', 'PK Balón', 'PK Reta', 'PK Street'];
const currentTermsVersion = 'terms-v1-2026-06';
const currentPrivacyVersion = 'privacy-v1-2026-06';

function calculateAge(day: string, month: string, year: string) {
  if (!day || !month || !year) return null;
  const birth = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    day: '', month: '', year: '', firstName: '', lastName: '', gender: '', email: '', password: '',
    state: 'Ciudad de México', municipality: 'Cuauhtémoc', nickname: '', avatar: avatarOptions[0],
    guardianName: '', guardianEmail: '', guardianRelation: '',
    terms: false, privacy: false, promotions: false, media: false, guardianConsent: false
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const age = useMemo(() => calculateAge(form.day, form.month, form.year), [form.day, form.month, form.year]);
  const isMinor = age !== null && age < 18;
  const isUnder13 = age !== null && age < 13;
  const municipalities = states[form.state] || [];

  function update(key: string, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'state') next.municipality = (states[value as string] || [''])[0];
      return next;
    });
  }

  function canAdvance() {
    if (step === 1) return age !== null && age >= 0;
    if (step === 2) return form.firstName.trim() && form.lastName.trim();
    if (step === 3) return form.email.trim() && form.state && form.municipality;
    if (step === 4) return form.nickname.trim().length >= 3 && form.password.length >= 8;
    return true;
  }

  async function submit() {
    setMessage('');

    if (!form.terms || !form.privacy) {
      setMessage('Debes aceptar Términos y Aviso de Privacidad para continuar.');
      return;
    }

    if (isMinor && (!form.guardianName || !form.guardianEmail || !form.guardianRelation || !form.guardianConsent)) {
      setMessage('Para menores de edad se requiere autorización de madre, padre o tutor.');
      return;
    }

    setLoading(true);
    const birthDate = `${form.year}-${form.month.padStart(2, '0')}-${form.day.padStart(2, '0')}`;
    const accountStatus = isMinor ? 'pending_parental_consent' : 'active';

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          gender: form.gender,
          birth_date: birthDate,
          state: form.state,
          municipality: form.municipality,
          nickname: form.nickname,
          avatar: form.avatar,
          is_minor: isMinor,
          account_status: accountStatus,
          terms_version: currentTermsVersion,
          privacy_version: currentPrivacyVersion,
          promotions_consent: form.promotions,
          media_consent: form.media,
          guardian_name: form.guardianName,
          guardian_email: form.guardianEmail,
          guardian_relation: form.guardianRelation
        }
      }
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    if (data.user) {
      const profilePayload = {
        id: data.user.id,
        display_name: `${form.firstName} ${form.lastName}`.trim(),
        first_name: form.firstName,
        last_name: form.lastName,
        gender: form.gender || null,
        birth_date: birthDate,
        is_minor: isMinor,
        account_status: accountStatus,
        email: form.email,
        state: form.state,
        municipality: form.municipality,
        alias: form.nickname,
        avatar_key: form.avatar,
        role: 'player'
      };

      await supabase.from('prokicks_profiles').upsert(profilePayload);

    }

    setLoading(false);
    window.location.href = isMinor ? '/registro/pendiente' : '/';
  }

  return (
    <main className="register-screen">
      <header className="register-header">
        <Link href="/login" className="back-link"><ChevronLeft size={18} /> Volver</Link>
        <Image src="/logo-negro.png" alt="ProKicks" width={120} height={40} className="logo" />
      </header>

      <section className="register-title">
        <span>Registro ProKicks</span>
        <h1>Crea tu cuenta</h1>
        <p>Datos mínimos, perfil deportivo y consentimientos separados.</p>
      </section>

      <div className="stepper" aria-label="Paso de registro">
        {[1, 2, 3, 4, 5].map((n) => <span key={n} className={step >= n ? 'active' : ''} />)}
      </div>

      <section className="register-card">
        {step === 1 && <>
          <div className="card-head"><CalendarDays /><div><h2>Fecha de nacimiento</h2><p>Calculamos edad para proteger a menores.</p></div></div>
          <div className="date-grid">
            <select value={form.day} onChange={(e) => update('day', e.target.value)}><option value="">Día</option>{Array.from({ length: 31 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select>
            <select value={form.month} onChange={(e) => update('month', e.target.value)}><option value="">Mes</option>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select>
            <select value={form.year} onChange={(e) => update('year', e.target.value)}><option value="">Año</option>{Array.from({ length: 85 }, (_, i) => new Date().getFullYear() - i).map((y) => <option key={y}>{y}</option>)}</select>
          </div>
          {age !== null && <div className={`age-note ${isMinor ? 'minor' : ''}`}>{isUnder13 ? 'Menor de 13: el perfil debe ser administrado por tutor.' : isMinor ? 'Menor de edad: requeriremos autorización de tutor.' : 'Mayor de edad: registro normal.'}</div>}
        </>}

        {step === 2 && <>
          <div className="card-head"><UserRound /><div><h2>Datos personales</h2><p>Solo lo necesario para tu perfil.</p></div></div>
          <input placeholder="Nombre(s)" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} />
          <input placeholder="Apellidos" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
          <select value={form.gender} onChange={(e) => update('gender', e.target.value)}>
            <option value="">Género opcional</option><option>Hombre</option><option>Mujer</option><option>Otro</option><option>Prefiero no decirlo</option>
          </select>
        </>}

        {step === 3 && <>
          <div className="card-head"><Mail /><div><h2>Contacto y ubicación</h2><p>Email obligatorio. No pedimos WhatsApp ni domicilio.</p></div></div>
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} />
          <select value={form.state} onChange={(e) => update('state', e.target.value)}>{Object.keys(states).map((s) => <option key={s}>{s}</option>)}</select>
          <select value={form.municipality} onChange={(e) => update('municipality', e.target.value)}>{municipalities.map((m) => <option key={m}>{m}</option>)}</select>
        </>}

        {step === 4 && <>
          <div className="card-head"><UserRound /><div><h2>Nickname y avatar</h2><p>Tu identidad pública dentro de ProKicks.</p></div></div>
          <input placeholder="Nickname" value={form.nickname} onChange={(e) => update('nickname', e.target.value)} />
          <select value={form.avatar} onChange={(e) => update('avatar', e.target.value)}>{avatarOptions.map((a) => <option key={a}>{a}</option>)}</select>
          <input type="password" placeholder="Contraseña mínimo 8 caracteres" value={form.password} onChange={(e) => update('password', e.target.value)} />
        </>}

        {step === 5 && <>
          <div className="card-head"><ShieldCheck /><div><h2>Consentimientos</h2><p>Separados para cumplir mejor y no mezclar permisos.</p></div></div>
          {isMinor && <div className="guardian-box">
            <strong>Autorización de tutor</strong>
            <input placeholder="Nombre de madre, padre o tutor" value={form.guardianName} onChange={(e) => update('guardianName', e.target.value)} />
            <input type="email" placeholder="Email del tutor" value={form.guardianEmail} onChange={(e) => update('guardianEmail', e.target.value)} />
            <select value={form.guardianRelation} onChange={(e) => update('guardianRelation', e.target.value)}><option value="">Relación</option><option>Madre</option><option>Padre</option><option>Tutor legal</option></select>
            <label className="check"><input type="checkbox" checked={form.guardianConsent} onChange={(e) => update('guardianConsent', e.target.checked)} /> Confirmo que el tutor deberá autorizar esta cuenta.</label>
          </div>}
          <label className="check"><input type="checkbox" checked={form.terms} onChange={(e) => update('terms', e.target.checked)} /> Acepto Términos y Condiciones</label>
          <label className="check"><input type="checkbox" checked={form.privacy} onChange={(e) => update('privacy', e.target.checked)} /> He leído el Aviso de Privacidad</label>
          <label className="check"><input type="checkbox" checked={form.promotions} onChange={(e) => update('promotions', e.target.checked)} /> Quiero recibir promociones</label>
          <label className="check"><input type="checkbox" checked={form.media} onChange={(e) => update('media', e.target.checked)} /> Autorizo uso público de fotos/videos de eventos</label>
          <p className="legal-note">Antes del lanzamiento, textos legales y consentimiento parental deben revisarse con abogado mexicano de privacidad digital.</p>
        </>}

        {message && <div className="alert error">{message}</div>}

        <div className="register-actions">
          {step > 1 && <button className="btn btn-soft" onClick={() => setStep(step - 1)}>Atrás</button>}
          {step < 5 && <button className="btn btn-primary" disabled={!canAdvance()} onClick={() => setStep(step + 1)}>Continuar</button>}
          {step === 5 && <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Creando...' : isMinor ? 'Solicitar alta' : 'Crear cuenta'}</button>}
        </div>
      </section>
    </main>
  );
}
