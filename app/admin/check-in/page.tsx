'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Search } from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/monitoring';
import { formatDateTimeEs } from '@/lib/format';

type Registration = {
  id: string;
  participant1_name: string | null;
  participant2_name: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  modality: string | null;
  branch: string | null;
  registration_status: string | null;
  check_in_code: string | null;
  check_in_status: string | null;
  check_in_at: string | null;
  tournament?: { title: string | null } | null;
};

const SELECT_FIELDS = 'id,participant1_name,participant2_name,contact_email,contact_whatsapp,modality,branch,registration_status,check_in_code,check_in_status,check_in_at,tournament:prokicks_tournaments(title)';

function CheckInTool() {
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('code') || '');
  const [candidates, setCandidates] = useState<Registration[]>([]);
  const [item, setItem] = useState<Registration | null>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function lookup(nextTerm = term) {
    const cleanTerm = nextTerm.trim();
    setItem(null);
    setCandidates([]);
    if (!cleanTerm) {
      setMsg('Escribe nombre y apellido para buscar.');
      return;
    }
    setLoading(true);
    setMsg('Buscando participante...');

    const byCode = await supabase
      .from('prokicks_tournament_registrations')
      .select(SELECT_FIELDS)
      .eq('check_in_code', cleanTerm)
      .maybeSingle();

    if (byCode.data) {
      setLoading(false);
      setItem(byCode.data as unknown as Registration);
      setMsg('Registro encontrado.');
      return;
    }

    const { data, error } = await supabase
      .from('prokicks_tournament_registrations')
      .select(SELECT_FIELDS)
      .or(`participant1_name.ilike.%${cleanTerm}%,participant2_name.ilike.%${cleanTerm}%`)
      .limit(10);

    setLoading(false);
    if (error) {
      captureError(error, { area: 'admin-check-in-select' });
      setMsg(error.message);
      return;
    }
    const results = (data || []) as unknown as Registration[];
    if (results.length === 0) {
      setMsg('No encontramos a nadie con ese nombre. Prueba con nombre y apellido, o pídele que confirme cómo se registró.');
      return;
    }
    if (results.length === 1) {
      setItem(results[0]);
      setMsg('Registro encontrado.');
      return;
    }
    setCandidates(results);
    setMsg(`Encontramos ${results.length} coincidencias. Selecciona la correcta (si hace falta, pide el nombre completo con dos apellidos).`);
  }

  function pickCandidate(candidate: Registration) {
    setCandidates([]);
    setItem(candidate);
    setMsg('Registro encontrado.');
  }

  async function markCheckedIn() {
    if (!item?.id) return;
    setLoading(true);
    setMsg('Marcando asistencia...');
    const { error } = await supabase
      .from('prokicks_tournament_registrations')
      .update({ check_in_status: 'checked_in', check_in_at: new Date().toISOString(), checked_in_by: 'admin' })
      .eq('id', item.id);
    setLoading(false);
    if (error) {
      captureError(error, { area: 'admin-check-in-update' });
      setMsg(error.message);
      return;
    }
    setItem({ ...item, check_in_status: 'checked_in', check_in_at: new Date().toISOString() });
    setMsg('Check-in confirmado.');
  }

  useEffect(() => {
    const initialCode = searchParams.get('code');
    if (initialCode) lookup(initialCode);
  }, []);

  return (
    <AdminShell active="dashboard">
      <section className="hero section">
        <div className="kicker">Admin · Check-in</div>
        <h1 className="h1">Check-in de torneo</h1>
        <p className="p">Busca al participante por nombre y apellido y marca asistencia el día del torneo.</p>
      </section>
      <section className="card form section">
        <input className="input" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Nombre y apellido" onKeyDown={(e) => e.key === 'Enter' && lookup()} />
        <button className="btn btn-primary btn-full" disabled={loading} onClick={() => lookup()}><Search size={16} /> Buscar participante</button>
        {msg && <div className={item ? 'alert ok' : 'alert warn'}>{msg}</div>}
      </section>
      {candidates.length > 0 && (
        <section className="card form section detail-bottom-safe">
          {candidates.map((candidate) => (
            <button key={candidate.id} className="btn btn-soft btn-full checkin-candidate" onClick={() => pickCandidate(candidate)}>
              <strong>{candidate.participant1_name || 'Participante'}</strong>
              {candidate.participant2_name ? ` · ${candidate.participant2_name}` : ''}
              <span className="helper-text"> — {candidate.tournament?.title || 'Torneo'} · {candidate.modality || 'modalidad'} · {candidate.branch || ''}</span>
            </button>
          ))}
        </section>
      )}
      {item && (
        <section className="card form section detail-bottom-safe">
          <span className="tag tag-blue">{item.tournament?.title || 'Torneo'}</span>
          <h2 className="card-title">{item.participant1_name || 'Participante'}{item.participant2_name ? ` / ${item.participant2_name}` : ''}</h2>
          <p className="p">{item.modality || 'modalidad'} · {item.branch || ''} · {item.registration_status || 'registro'}</p>
          <p className="p">{item.contact_email || 'sin email'} · {item.contact_whatsapp || 'sin WhatsApp'}</p>
          <p className="field-label">Estado check-in</p>
          <p className="p">{item.check_in_status || 'pendiente'}{item.check_in_at ? ` · ${formatDateTimeEs(item.check_in_at)}` : ''}</p>
          <button className="btn btn-warm btn-full" disabled={loading || item.check_in_status === 'checked_in'} onClick={markCheckedIn}><CheckCircle2 size={16} /> Confirmar asistencia</button>
        </section>
      )}
    </AdminShell>
  );
}

export default function AdminCheckInPage() {
  return <Suspense fallback={<AdminShell active="dashboard"><section className="card section"><p className="p">Cargando check-in...</p></section></AdminShell>}><CheckInTool /></Suspense>;
}
