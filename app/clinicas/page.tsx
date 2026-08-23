'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CalendarDays, ChevronLeft, Clock, GraduationCap, ListChecks, MapPin, ShieldCheck } from 'lucide-react';
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
          <div className="kicker">Clínica Gratuita ProKicks</div>
          <h1 className="h1">¡Ya quedaste anotado!</h1>
          <p className="p">Te contactaremos por WhatsApp para confirmar tu lugar el próximo martes en Indoor Community.</p>
          <Link className="btn btn-primary btn-full section" href="/play">Volver al inicio</Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell active="home">
      <Link href="/play" className="back-link"><ChevronLeft size={18} /> Volver</Link>

      <section className="hero section">
        <div className="kicker">ProKicks × Indoor Community F.C.</div>
        <h1 className="h1">Clínica Gratuita de ProKicks</h1>
        <p className="p">Aprende. Juega. Mejora. Ven y descubre ProKicks, el juego de fútbol 360° que mejora tu técnica, velocidad, reflejos y toma de decisiones.</p>
      </section>

      <section className="card section">
        <div className="card-head">
          <CalendarDays />
          <div>
            <h2>Todos los martes</h2>
            <p>Del martes 25 de agosto hasta noviembre.</p>
          </div>
        </div>
        <div className="grid-2">
          <div className="row"><Clock size={18} color="#173B63" /><span>7:00 pm a 8:00 pm</span></div>
          <div className="row"><MapPin size={18} color="#173B63" /><span>Indoor Community · Av. Toluca 481, Olivar de los Padres, Álvaro Obregón, 01780 CDMX</span></div>
        </div>
        <div className="alert ok">Evento gratuito · Abierta para todos los niveles</div>
      </section>

      <section className="card section">
        <div className="card-head">
          <ListChecks />
          <div>
            <h2>¿Qué aprenderás?</h2>
            <p>Contenido de cada sesión.</p>
          </div>
        </div>
        <div className="grid-2">
          <div className="row"><ShieldCheck size={18} color="#173B63" /><span>Reglas del juego</span></div>
          <div className="row"><ShieldCheck size={18} color="#173B63" /><span>Tipos de juego: singles y dobles</span></div>
          <div className="row"><ShieldCheck size={18} color="#173B63" /><span>Técnica y táctica</span></div>
          <div className="row"><ShieldCheck size={18} color="#173B63" /><span>Juego abierto y divertido</span></div>
          <div className="row"><ShieldCheck size={18} color="#173B63" /><span>Conoce a otros jugadores</span></div>
        </div>
      </section>

      <section className="card form section">
        <div className="card-head">
          <GraduationCap />
          <div>
            <h2>Aparta tu lugar</h2>
            <p>Cupo limitado por sesión. Te confirmamos por WhatsApp.</p>
          </div>
        </div>
        <input className="input" placeholder="Nombre completo" value={form.name} onChange={(e) => update('name', e.target.value)} />
        <input className="input" inputMode="tel" placeholder="WhatsApp · 10 dígitos" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
        <input className="input" type="email" placeholder="Correo (opcional)" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <input className="input" inputMode="numeric" placeholder="Edad (opcional)" value={form.age} onChange={(e) => update('age', e.target.value.replace(/[^0-9]/g, ''))} />
        <textarea className="input" placeholder="¿Algo que debamos saber? (opcional)" value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} />
        {message && <div className="alert warn">{message}</div>}
        <button className="btn btn-primary btn-full" disabled={loading || !canSubmit} onClick={submit}>
          {loading ? 'Enviando...' : 'Quiero mi lugar'}
        </button>
      </section>
    </AppShell>
  );
}
