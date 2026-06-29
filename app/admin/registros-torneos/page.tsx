'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { captureError } from '@/lib/monitoring';

type Registration = {
  id: string;
  tournament_id: string | null;
  user_id: string | null;
  participant_name?: string | null;
  participant_email?: string | null;
  player_name?: string | null;
  player_email?: string | null;
  nickname?: string | null;
  team_name?: string | null;
  modality?: string | null;
  branch?: string | null;
  age_category?: string | null;
  contact_email?: string | null;
  contact_whatsapp?: string | null;
  participant_1_name?: string | null;
  participant_1_age?: number | null;
  participant_1_whatsapp?: string | null;
  participant_2_name?: string | null;
  participant_2_age?: number | null;
  participant_2_whatsapp?: string | null;
  accepted_rules?: boolean | null;
  accepted_image_release?: boolean | null;
  guardian_required?: boolean | null;
  guardian_name?: string | null;
  guardian_whatsapp?: string | null;
  guardian_email?: string | null;
  guardian_accepted?: boolean | null;
  cost?: number | null;
  currency?: string | null;
  payment_status?: string | null;
  payment_method?: string | null;
  registration_status?: string | null;
  status: string;
  created_at: string;
  tournament?: { title: string } | null;
};

function toCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return '';
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function label(value?: string | null) {
  if (!value) return '-';
  return value.replace(/_/g, ' ');
}

function money(value?: number | null, currency = 'MXN') {
  if (!value) return 'Sin costo';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(Number(value));
}

export default function AdminRegistrosTorneosPage() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const flat = useMemo(() => rows.map((r) => ({
    id: r.id,
    torneo: r.tournament?.title || r.tournament_id || 'Demo',
    modalidad: label(r.modality),
    rama: label(r.branch),
    categoria_edad: label(r.age_category),
    equipo_dupla: r.team_name || '',
    participante_1: r.participant_1_name || r.participant_name || r.player_name || '',
    edad_1: r.participant_1_age || '',
    whatsapp_1: r.participant_1_whatsapp || '',
    participante_2: r.participant_2_name || '',
    edad_2: r.participant_2_age || '',
    whatsapp_2: r.participant_2_whatsapp || '',
    email_contacto: r.contact_email || r.participant_email || r.player_email || '',
    whatsapp_contacto: r.contact_whatsapp || '',
    costo: money(r.cost, r.currency || 'MXN'),
    payment_status: label(r.payment_status),
    registration_status: label(r.registration_status || r.status),
    reglamento_aceptado: r.accepted_rules ? 'Sí' : 'No',
    imagen_aceptada: r.accepted_image_release ? 'Sí' : 'No',
    requiere_tutor: r.guardian_required ? 'Sí' : 'No',
    tutor: r.guardian_name || '',
    whatsapp_tutor: r.guardian_whatsapp || '',
    email_tutor: r.guardian_email || '',
    autorizacion_tutor: r.guardian_accepted ? 'Sí' : 'No',
    fecha: r.created_at,
  })), [rows]);

  async function load() {
    setLoading(true);
    setMsg('');
    const { data, error } = await supabase
      .from('prokicks_tournament_registrations')
      .select('*, tournament:prokicks_tournaments(title)')
      .order('created_at', { ascending: false });
    if (error) {
      captureError(error, { area: 'admin-registrations-select' });
      setMsg(error.message);
    }
    setRows((data || []) as Registration[]);
    setLoading(false);
  }

  useEffect(() => {
    trackEvent('Admin Registrations Viewed');
    load();
  }, []);

  return (
    <AppShell active="perfil">
      <section className="hero section">
        <div className="kicker">Admin · Registros</div>
        <h1 className="h1">Registros a Torneos</h1>
        <p className="p">Consulta participantes, modalidad, rama, costo, pago y consentimientos.</p>
      </section>

      <section className="card form section">
        <div className="row">
          <strong>{loading ? 'Cargando...' : `${rows.length} registros`}</strong>
          <button className="btn btn-soft" onClick={load}>Actualizar</button>
        </div>
        <button className="btn btn-primary btn-full" onClick={() => download('prokicks_registros_torneos.csv', toCSV(flat))}>
          <Download size={16} /> Exportar registros CSV
        </button>
        {msg && <p className="p">{msg}</p>}

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Torneo</th>
                <th>Modalidad</th>
                <th>Participante 1</th>
                <th>Participante 2</th>
                <th>Contacto</th>
                <th>Costo / pago</th>
                <th>Legal</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {flat.map((r) => (
                <tr key={r.id}>
                  <td>{r.torneo}</td>
                  <td>{r.modalidad}<br /><small>{r.rama}</small></td>
                  <td>{r.participante_1}<br /><small>{r.whatsapp_1}</small></td>
                  <td>{r.participante_2 || '-'}<br /><small>{r.whatsapp_2}</small></td>
                  <td>{r.email_contacto}<br /><small>{r.whatsapp_contacto}</small></td>
                  <td>{r.costo}<br /><small>{r.payment_status}</small></td>
                  <td>Reglas: {r.reglamento_aceptado}<br />Imagen: {r.imagen_aceptada}<br /><small>Tutor: {r.requiere_tutor} {r.tutor ? `· ${r.tutor}` : ''}</small></td>
                  <td>{r.registration_status}<br /><small>{new Date(r.fecha).toLocaleString('es-MX')}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <p className="p">Aún no hay registros.</p>}
      </section>
      <section className="section"><Link className="btn btn-soft btn-full" href="/admin">Volver a Admin</Link></section>
    </AppShell>
  );
}
