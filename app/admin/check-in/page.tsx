'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Search } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/monitoring';

type Registration = {
  id: string;
  participant1_name: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  modality: string | null;
  registration_status: string | null;
  check_in_code: string | null;
  check_in_status: string | null;
  check_in_at: string | null;
  tournament?: { title: string | null } | null;
};

function CheckInTool() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [item, setItem] = useState<Registration | null>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function lookup(nextCode = code) {
    const cleanCode = nextCode.trim();
    if (!cleanCode) {
      setMsg('Captura un código de check-in.');
      setItem(null);
      return;
    }
    setLoading(true);
    setMsg('Buscando registro...');
    const { data, error } = await supabase
      .from('prokicks_tournament_registrations')
      .select('id,participant1_name,contact_email,contact_whatsapp,modality,registration_status,check_in_code,check_in_status,check_in_at,tournament:prokicks_tournaments(title)')
      .eq('check_in_code', cleanCode)
      .maybeSingle();
    setLoading(false);
    if (error) {
      captureError(error, { area: 'admin-check-in-select' });
      setMsg(error.message);
      setItem(null);
      return;
    }
    if (!data) {
      setMsg('No encontramos registro con ese código.');
      setItem(null);
      return;
    }
    setItem(data as unknown as Registration);
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
    <AppShell active="perfil">
      <section className="hero section">
        <div className="kicker">Admin · Check-in</div>
        <h1 className="h1">Validar QR de torneo</h1>
        <p className="p">Busca el código del participante y marca asistencia el día del torneo.</p>
      </section>
      <section className="card form section">
        <input className="input" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Código de check-in" />
        <button className="btn btn-primary btn-full" disabled={loading} onClick={() => lookup()}><Search size={16} /> Buscar registro</button>
        {msg && <div className={item ? 'alert ok' : 'alert warn'}>{msg}</div>}
      </section>
      {item && (
        <section className="card form section detail-bottom-safe">
          <span className="tag tag-blue">{item.tournament?.title || 'Torneo'}</span>
          <h2 className="card-title">{item.participant1_name || 'Participante'}</h2>
          <p className="p">{item.modality || 'modalidad'} · {item.registration_status || 'registro'}</p>
          <p className="p">{item.contact_email || 'sin email'} · {item.contact_whatsapp || 'sin WhatsApp'}</p>
          <p className="field-label">Estado check-in</p>
          <p className="p">{item.check_in_status || 'pendiente'}{item.check_in_at ? ` · ${new Date(item.check_in_at).toLocaleString('es-MX')}` : ''}</p>
          <button className="btn btn-warm btn-full" disabled={loading || item.check_in_status === 'checked_in'} onClick={markCheckedIn}><CheckCircle2 size={16} /> Confirmar asistencia</button>
        </section>
      )}
    </AppShell>
  );
}

export default function AdminCheckInPage() {
  return <Suspense fallback={<AppShell active="perfil"><section className="card section"><p className="p">Cargando check-in...</p></section></AppShell>}><CheckInTool /></Suspense>;
}
