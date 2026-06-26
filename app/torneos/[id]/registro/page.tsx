'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, ShieldCheck, Trophy, UserRound, UsersRound } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

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
  contactWhatsapp: string;
  participant1: Participant;
  participant2: Participant;
  acceptedRules: boolean;
  acceptedImageRelease: boolean;
  guardianName: string;
  guardianWhatsapp: string;
  guardianEmail: string;
  guardianAccepted: boolean;
};

const initialForm: RegistrationForm = {
  modality: 'individual',
  branch: 'libre',
  ageCategory: 'mayor_18',
  teamName: '',
  nickname: '',
  contactEmail: '',
  contactWhatsapp: '',
  participant1: { name: '', age: '', whatsapp: '' },
  participant2: { name: '', age: '', whatsapp: '' },
  acceptedRules: false,
  acceptedImageRelease: false,
  guardianName: '',
  guardianWhatsapp: '',
  guardianEmail: '',
  guardianAccepted: false,
};

function normalizePhone(value: string) {
  return value.replace(/[^0-9+]/g, '').trim();
}

export default function TournamentRegistration() {
  const params = useParams<{ id: string }>();
  const tournamentId = params.id;
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const participants = useMemo(() => {
    const base = [form.participant1];
    if (form.modality === 'dupla') base.push(form.participant2);
    return base;
  }, [form.modality, form.participant1, form.participant2]);

  const hasMinor = useMemo(
    () => participants.some((p) => Number(p.age) > 0 && Number(p.age) < 18),
    [participants]
  );

  const canSubmit = useMemo(() => {
    const p1Ready = form.participant1.name.trim() && form.participant1.age.trim() && form.participant1.whatsapp.trim();
    const p2Ready = form.modality === 'individual' || (form.participant2.name.trim() && form.participant2.age.trim() && form.participant2.whatsapp.trim());
    const contactReady = form.contactEmail.trim() && form.contactWhatsapp.trim();
    const legalReady = form.acceptedRules && form.acceptedImageRelease;
    const guardianReady = !hasMinor || (form.guardianName.trim() && form.guardianWhatsapp.trim() && form.guardianAccepted);
    return Boolean(p1Ready && p2Ready && contactReady && legalReady && guardianReady);
  }, [form, hasMinor]);

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
    if (!canSubmit || loading) return;
    setLoading(true);
    setMessage('');

    const cleanParticipants = participants.map((p, index) => ({
      number: index + 1,
      name: p.name.trim(),
      age: Number(p.age),
      whatsapp: normalizePhone(p.whatsapp),
    }));

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
      contact_whatsapp: normalizePhone(form.contactWhatsapp),
      participant_1_name: form.participant1.name.trim(),
      participant_1_age: Number(form.participant1.age),
      participant_1_whatsapp: normalizePhone(form.participant1.whatsapp),
      participant_2_name: form.modality === 'dupla' ? form.participant2.name.trim() : null,
      participant_2_age: form.modality === 'dupla' ? Number(form.participant2.age) : null,
      participant_2_whatsapp: form.modality === 'dupla' ? normalizePhone(form.participant2.whatsapp) : null,
      participants: cleanParticipants,
      accepted_rules: form.acceptedRules,
      accepted_image_release: form.acceptedImageRelease,
      rules_version: 'prokicks-rules-v1',
      guardian_required: hasMinor,
      guardian_name: hasMinor ? form.guardianName.trim() : null,
      guardian_whatsapp: hasMinor ? normalizePhone(form.guardianWhatsapp) : null,
      guardian_email: hasMinor && form.guardianEmail ? form.guardianEmail.trim().toLowerCase() : null,
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
      },
      notes: `Registro a Torneos · ${form.modality === 'dupla' ? 'Dupla' : 'Individual'} · ${form.branch} · ${hasMinor ? 'menor con tutor' : '18+'}`,
      status: 'registered',
      cost: 0,
    };

    const { error } = await supabase.from('prokicks_tournament_registrations').insert(payload);
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Registro recibido. Guardamos tu lugar y tus aceptaciones de reglamento e imagen.');
    setForm(initialForm);
  }

  return (
    <AppShell active="torneos">
      <Link href={`/torneos/${tournamentId}`} className="back-link"><ChevronLeft size={18} /> Volver</Link>

      <section className="hero section">
        <div className="kicker">Registro a Torneos</div>
        <h1 className="h1">Aparta tu lugar</h1>
        <p className="p">Completa los datos de participantes, modalidad y consentimientos. Primera etapa sin costo.</p>
      </section>

      <section className="card form section">
        <div className="card-head">
          <Trophy />
          <div>
            <h2>Datos del torneo</h2>
            <p>Selecciona cómo vas a participar.</p>
          </div>
        </div>

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
        <input className="input" placeholder="Nombre completo" value={form.participant1.name} onChange={(e) => updateParticipant('participant1', 'name', e.target.value)} />
        <input className="input" inputMode="numeric" placeholder="Edad" value={form.participant1.age} onChange={(e) => updateParticipant('participant1', 'age', e.target.value.replace(/[^0-9]/g, ''))} />
        <input className="input" placeholder="WhatsApp" value={form.participant1.whatsapp} onChange={(e) => updateParticipant('participant1', 'whatsapp', e.target.value)} />
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
          <input className="input" placeholder="Nombre completo" value={form.participant2.name} onChange={(e) => updateParticipant('participant2', 'name', e.target.value)} />
          <input className="input" inputMode="numeric" placeholder="Edad" value={form.participant2.age} onChange={(e) => updateParticipant('participant2', 'age', e.target.value.replace(/[^0-9]/g, ''))} />
          <input className="input" placeholder="WhatsApp" value={form.participant2.whatsapp} onChange={(e) => updateParticipant('participant2', 'whatsapp', e.target.value)} />
        </section>
      )}

      <section className="card form section">
        <div className="card-head">
          <ShieldCheck />
          <div>
            <h2>Contacto y consentimientos</h2>
            <p>Estos datos se usarán para confirmar el torneo.</p>
          </div>
        </div>

        <input className="input" type="email" placeholder="Correo de contacto" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
        <input className="input" placeholder="WhatsApp de contacto" value={form.contactWhatsapp} onChange={(e) => update('contactWhatsapp', e.target.value)} />
        <input className="input" placeholder="Nickname ProKicks opcional" value={form.nickname} onChange={(e) => update('nickname', e.target.value)} />

        <label className="check-row">
          <input type="checkbox" checked={form.acceptedRules} onChange={(e) => update('acceptedRules', e.target.checked)} />
          <span>Declaro que leí y acepto el Reglamento Oficial de Competencia ProKicks.</span>
        </label>
        <label className="check-row">
          <input type="checkbox" checked={form.acceptedImageRelease} onChange={(e) => update('acceptedImageRelease', e.target.checked)} />
          <span>Autorizo el uso de mi imagen para material del evento ProKicks.</span>
        </label>

        {hasMinor && <div className="alert warn">Detectamos un participante menor de edad. Se requiere autorización de madre, padre o tutor.</div>}
        {(hasMinor || form.ageCategory === 'menor_con_tutor') && (
          <div className="mini-stack">
            <input className="input" placeholder="Nombre del tutor" value={form.guardianName} onChange={(e) => update('guardianName', e.target.value)} />
            <input className="input" placeholder="WhatsApp del tutor" value={form.guardianWhatsapp} onChange={(e) => update('guardianWhatsapp', e.target.value)} />
            <input className="input" type="email" placeholder="Email del tutor opcional" value={form.guardianEmail} onChange={(e) => update('guardianEmail', e.target.value)} />
            <label className="check-row">
              <input type="checkbox" checked={form.guardianAccepted} onChange={(e) => update('guardianAccepted', e.target.checked)} />
              <span>Confirmo que cuento con autorización del tutor para participar.</span>
            </label>
          </div>
        )}

        {message && <div className={message.includes('recibido') ? 'alert ok' : 'alert warn'}>{message}</div>}
        <button className="btn btn-primary btn-full" disabled={loading || !canSubmit} onClick={submit}>
          {loading ? 'Registrando...' : 'Confirmar Registro a Torneos'}
        </button>
      </section>
    </AppShell>
  );
}
