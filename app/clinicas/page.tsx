'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, GraduationCap, ShieldCheck, Target, Users } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { captureError } from '@/lib/monitoring';

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

export default function ClinicasPage() {
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', age: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const canSubmit = form.name.trim().length >= 3 && digitsOnly(form.whatsapp).length >= 10;

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    setMessage('');
    if (!canSubmit) {
      setMessage('Escribe tu nombre completo y un WhatsApp válido para anotarte.');
      return;
    }

    setLoading(true);
    trackEvent('Clinic Interest Submitted');

    const { error } = await supabase.from('prokicks_clinic_interest').insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase() || null,
      whatsapp: form.whatsapp.trim(),
      age: form.age.trim() || null,
      notes: form.notes.trim() || null,
    });

    setLoading(false);

    if (error) {
      captureError(error, { area: 'clinic-interest-insert' });
      setMessage('No pudimos guardar tu registro. Intenta de nuevo en un momento.');
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <AppShell active="home">
        <section className="hero section confirmation-hero">
          <div className="kicker">Clínicas ProKicks</div>
          <h1 className="h1">¡Ya quedaste anotado!</h1>
          <p className="p">Te contactaremos por WhatsApp con la fecha, el costo y el cupo disponible de la próxima clínica de técnica individual.</p>
          <Link className="btn btn-primary btn-full section" href="/play">Volver al inicio</Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell active="home">
      <Link href="/play" className="back-link"><ChevronLeft size={18} /> Volver</Link>

      <section className="hero section">
        <div className="kicker">Clínicas ProKicks</div>
        <h1 className="h1">Clínica de Técnica Individual</h1>
        <p className="p">Entrenamiento enfocado en fundamentos técnicos: control, conducción, definición y toma de decisiones, con feedback personalizado de un coach ProKicks.</p>
      </section>

      <section className="grid-2 section">
        <div className="card">
          <div className="row"><Target color="#173B63" /><div><h3 className="card-title">Enfoque individual</h3><p className="p">Grupos reducidos para maximizar repeticiones y corrección técnica.</p></div></div>
        </div>
        <div className="card">
          <div className="row"><GraduationCap color="#173B63" /><div><h3 className="card-title">Coach certificado</h3><p className="p">Sesiones dirigidas por el staff técnico de ProKicks.</p></div></div>
        </div>
        <div className="card">
          <div className="row"><Users color="#173B63" /><div><h3 className="card-title">Todas las edades</h3><p className="p">Abierta a jugadores de distintas categorías. Menores requieren autorización de tutor.</p></div></div>
        </div>
        <div className="card">
          <div className="row"><ShieldCheck color="#173B63" /><div><h3 className="card-title">Cupo limitado</h3><p className="p">Las fechas y el costo se confirman por WhatsApp según demanda.</p></div></div>
        </div>
      </section>

      <section className="card form section">
        <div className="card-head">
          <GraduationCap />
          <div>
            <h2>Anótate a la lista de interés</h2>
            <p>En cuanto abramos cupo para la siguiente clínica, te avisamos primero.</p>
          </div>
        </div>
        <input className="input" placeholder="Nombre completo" value={form.name} onChange={(e) => update('name', e.target.value)} />
        <input className="input" inputMode="tel" placeholder="WhatsApp · 10 dígitos" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
        <input className="input" type="email" placeholder="Correo (opcional)" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <input className="input" inputMode="numeric" placeholder="Edad (opcional)" value={form.age} onChange={(e) => update('age', e.target.value.replace(/[^0-9]/g, ''))} />
        <textarea className="input" placeholder="¿Algo que debamos saber? (opcional)" value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} />
        {message && <div className="alert warn">{message}</div>}
        <button className="btn btn-primary btn-full" disabled={loading || !canSubmit} onClick={submit}>
          {loading ? 'Enviando...' : 'Quiero que me avisen'}
        </button>
      </section>
    </AppShell>
  );
}
