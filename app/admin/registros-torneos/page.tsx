'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileSpreadsheet, FileText, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { captureError } from '@/lib/monitoring';
import { formatDateTimeEs } from '@/lib/format';

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

type EditForm = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  modality: string;
  branch: string;
  age_category: string;
  team_name: string;
};

type TournamentOption = {
  id: string;
  title: string;
  is_free?: boolean | null;
  cost?: number | null;
  currency?: string | null;
};

type NewRegForm = {
  tournament_id: string;
  modality: 'individual' | 'dupla';
  branch: 'varonil' | 'femenil' | 'mixta' | 'libre';
  age_category: 'mayor_18' | 'menor_con_tutor';
  team_name: string;
  nickname: string;
  contact_email: string;
  participant1_name: string;
  participant1_age: string;
  participant1_whatsapp: string;
  participant2_name: string;
  participant2_age: string;
  participant2_whatsapp: string;
  registration_status: 'confirmado' | 'pendiente';
  payment_status: 'sin_costo' | 'pago_pendiente' | 'pagado';
};

const emptyNewReg: NewRegForm = {
  tournament_id: '',
  modality: 'individual',
  branch: 'libre',
  age_category: 'mayor_18',
  team_name: '',
  nickname: '',
  contact_email: '',
  participant1_name: '',
  participant1_age: '',
  participant1_whatsapp: '',
  participant2_name: '',
  participant2_age: '',
  participant2_whatsapp: '',
  registration_status: 'confirmado',
  payment_status: 'sin_costo',
};

function label(value?: string | null) {
  if (!value) return '-';
  return value.replace(/_/g, ' ');
}

function money(value?: number | null, currency = 'MXN') {
  if (!value) return 'Sin costo';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(Number(value));
}

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

function makeCheckInCode() {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `PKC-${timePart}-${randomPart}`;
}

async function exportExcel(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');
  XLSX.writeFile(workbook, filename);
}

// Columnas curadas y en español para el PDF: el Excel ya lleva el detalle
// completo (24 campos), aquí solo mostramos lo esencial para que la tabla
// quepa legible en una hoja horizontal, sin encabezados partidos letra por letra.
const PDF_COLUMNS: { header: string; key: string }[] = [
  { header: 'Torneo', key: 'torneo' },
  { header: 'Modalidad', key: 'modalidad' },
  { header: 'Participante 1', key: 'participante_1' },
  { header: 'WhatsApp 1', key: 'whatsapp_1' },
  { header: 'Participante 2', key: 'participante_2' },
  { header: 'WhatsApp 2', key: 'whatsapp_2' },
  { header: 'Email de contacto', key: 'email_contacto' },
  { header: 'Costo', key: 'costo' },
  { header: 'Pago', key: 'payment_status' },
  { header: 'Estatus', key: 'registration_status' },
];

async function exportPDF(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setTextColor(23, 59, 99);
  doc.text('ProKicks Play · Registros a Torneos', 32, 32);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`${rows.length} registro${rows.length === 1 ? '' : 's'} · generado ${new Date().toLocaleDateString('es-MX')}`, 32, 46);

  autoTable(doc, {
    startY: 60,
    margin: { left: 24, right: 24 },
    tableWidth: pageWidth - 48,
    head: [PDF_COLUMNS.map((c) => c.header)],
    body: rows.map((row) => PDF_COLUMNS.map((c) => String(row[c.key] ?? '-'))),
    styles: { fontSize: 8.5, cellPadding: 5, overflow: 'linebreak', valign: 'middle' },
    headStyles: { fillColor: [23, 59, 99], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: [244, 246, 248] },
    columnStyles: {
      2: { cellWidth: 90 },
      4: { cellWidth: 90 },
      6: { cellWidth: 110 },
    },
  });

  doc.save(filename);
}

export default function AdminRegistrosTorneosPage() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [tournaments, setTournaments] = useState<TournamentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [edit, setEdit] = useState<EditForm | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newReg, setNewReg] = useState<NewRegForm>(emptyNewReg);
  const [savingNew, setSavingNew] = useState(false);
  const [newMsg, setNewMsg] = useState('');

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

  async function loadTournaments() {
    const { data, error } = await supabase
      .from('prokicks_tournaments')
      .select('id, title, is_free, cost, currency')
      .order('starts_at', { ascending: true });
    if (error) {
      captureError(error, { area: 'admin-registrations-tournaments-select' });
      return;
    }
    setTournaments((data || []) as TournamentOption[]);
  }

  function startEdit(row: Registration) {
    setEdit({
      id: row.id,
      name: row.participant_1_name || row.participant_name || row.player_name || '',
      email: row.contact_email || row.participant_email || row.player_email || '',
      whatsapp: row.contact_whatsapp || row.participant_1_whatsapp || '',
      modality: row.modality || '',
      branch: row.branch || '',
      age_category: row.age_category || '',
      team_name: row.team_name || '',
    });
    setMsg('');
  }

  function updateEdit<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setEdit((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  async function saveEdit() {
    if (!edit) return;
    setMsg('Guardando registro...');
    const payload = {
      participant_name: edit.name.trim(),
      player_name: edit.name.trim(),
      participant_1_name: edit.name.trim(),
      participant_email: edit.email.trim().toLowerCase(),
      player_email: edit.email.trim().toLowerCase(),
      contact_email: edit.email.trim().toLowerCase(),
      contact_whatsapp: edit.whatsapp.trim(),
      participant_1_whatsapp: edit.whatsapp.trim(),
      modality: edit.modality.trim(),
      branch: edit.branch.trim(),
      age_category: edit.age_category.trim(),
      team_name: edit.team_name.trim(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('prokicks_tournament_registrations').update(payload).eq('id', edit.id);
    if (error) {
      captureError(error, { area: 'admin-registrations-update', id: edit.id });
      setMsg(error.message);
      return;
    }

    setMsg('Registro actualizado.');
    setEdit(null);
    load();
  }

  async function remove(id: string) {
    const ok = window.confirm('¿Seguro que deseas eliminar este registro?');
    if (!ok) return;

    setMsg('Eliminando registro...');
    const { error } = await supabase.from('prokicks_tournament_registrations').delete().eq('id', id);
    if (error) {
      captureError(error, { area: 'admin-registrations-delete', id });
      setMsg(error.message);
      return;
    }

    setMsg('Registro eliminado.');
    if (edit?.id === id) setEdit(null);
    load();
  }

  function updateNewReg<K extends keyof NewRegForm>(key: K, value: NewRegForm[K]) {
    setNewReg((prev) => ({ ...prev, [key]: value }));
  }

  function resetNewReg() {
    setNewReg(emptyNewReg);
    setNewMsg('');
  }

  async function createRegistration() {
    setNewMsg('');
    if (!newReg.tournament_id) {
      setNewMsg('Selecciona un torneo.');
      return;
    }
    if (!newReg.participant1_name.trim() || !newReg.participant1_whatsapp.trim()) {
      setNewMsg('Nombre y WhatsApp del participante 1 son obligatorios.');
      return;
    }
    if (!newReg.contact_email.trim()) {
      setNewMsg('El correo de contacto es obligatorio.');
      return;
    }
    if (newReg.modality === 'dupla' && !newReg.participant2_name.trim()) {
      setNewMsg('Falta el nombre del participante 2 para modalidad dupla.');
      return;
    }

    const tournament = tournaments.find((t) => t.id === newReg.tournament_id);

    setSavingNew(true);

    const payload = {
      tournament_id: newReg.tournament_id,
      user_id: null,
      participant_name: newReg.participant1_name.trim(),
      participant_email: newReg.contact_email.trim().toLowerCase(),
      player_name: newReg.participant1_name.trim(),
      player_email: newReg.contact_email.trim().toLowerCase(),
      nickname: newReg.nickname.trim() || null,
      team_name: newReg.team_name.trim() || null,
      modality: newReg.modality,
      branch: newReg.branch,
      age_category: newReg.age_category,
      contact_email: newReg.contact_email.trim().toLowerCase(),
      contact_whatsapp: normalizeWhatsapp(newReg.participant1_whatsapp),
      participant_1_name: newReg.participant1_name.trim(),
      participant_1_age: newReg.participant1_age ? Number(newReg.participant1_age) : null,
      participant_1_whatsapp: normalizeWhatsapp(newReg.participant1_whatsapp),
      participant_2_name: newReg.modality === 'dupla' ? newReg.participant2_name.trim() : null,
      participant_2_age: newReg.modality === 'dupla' && newReg.participant2_age ? Number(newReg.participant2_age) : null,
      participant_2_whatsapp: newReg.modality === 'dupla' ? normalizeWhatsapp(newReg.participant2_whatsapp) : null,
      accepted_rules: true,
      accepted_image_release: true,
      rules_version: 'prokicks-rules-v1',
      guardian_required: newReg.age_category === 'menor_con_tutor',
      notes: `Registro creado por admin · ${newReg.modality === 'dupla' ? 'Dupla' : 'Individual'} · ${newReg.branch}`,
      status: newReg.registration_status,
      cost: tournament ? Number(tournament.cost || 0) : 0,
      currency: tournament?.currency || 'MXN',
      payment_status: newReg.payment_status,
      registration_status: newReg.registration_status,
      payment_method: newReg.payment_status === 'sin_costo' ? 'sin_costo' : 'admin_manual',
      check_in_code: makeCheckInCode(),
      check_in_status: 'pending',
    };

    let error = (await supabase.from('prokicks_tournament_registrations').insert(payload)).error;
    if (error && (error.message?.includes('check_in') || error.code === '42703')) {
      const { check_in_code: _checkInCode, check_in_status: _checkInStatus, ...payloadWithoutCheckIn } = payload;
      error = (await supabase.from('prokicks_tournament_registrations').insert(payloadWithoutCheckIn)).error;
    }

    setSavingNew(false);

    if (error) {
      captureError(error, { area: 'admin-registrations-create' });
      setNewMsg(error.message);
      return;
    }

    trackEvent('Admin Registration Created', { tournament_id: newReg.tournament_id, modality: newReg.modality });
    setNewMsg('Registro creado correctamente.');
    resetNewReg();
    setShowNew(false);
    load();
  }

  useEffect(() => {
    trackEvent('Admin Registrations Viewed');
    load();
    loadTournaments();
  }, []);

  return (
    <AdminShell active="registros">
      <section className="hero section">
        <div className="kicker">Admin · Registros</div>
        <h1 className="h1">Registros a Torneos</h1>
        <p className="p">Consulta participantes, modalidad, rama, costo, pago y consentimientos.</p>
      </section>

      <section className="card form section">
        <div className="row">
          <strong>{loading ? 'Cargando...' : `${rows.length} registros`}</strong>
          <div className="admin-actions">
            <button className="btn btn-soft" onClick={load}>Actualizar</button>
            <button className="btn btn-primary" onClick={() => setShowNew((prev) => !prev)}>
              {showNew ? <X size={16} /> : <Plus size={16} />} {showNew ? 'Cancelar' : 'Nuevo registro'}
            </button>
          </div>
        </div>

        {showNew && (
          <div className="admin-edit-box">
            <h2 className="card-title">Nuevo registro manual</h2>
            <p className="p">Úsalo para inscribir participantes que se registran en persona o por WhatsApp.</p>

            <label className="field-label">Torneo</label>
            <select className="input" value={newReg.tournament_id} onChange={(e) => updateNewReg('tournament_id', e.target.value)}>
              <option value="">Selecciona un torneo</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.title}{t.is_free === false ? ` · ${money(t.cost, t.currency || 'MXN')}` : ' · Sin costo'}</option>
              ))}
            </select>

            <div className="grid-2 tight">
              <select className="input" value={newReg.modality} onChange={(e) => updateNewReg('modality', e.target.value as NewRegForm['modality'])}>
                <option value="individual">Individual / 1 jugador</option>
                <option value="dupla">Dupla / 2 jugadores</option>
              </select>
              <select className="input" value={newReg.branch} onChange={(e) => updateNewReg('branch', e.target.value as NewRegForm['branch'])}>
                <option value="varonil">Varonil</option>
                <option value="femenil">Femenil</option>
                <option value="mixta">Mixta</option>
                <option value="libre">Libre</option>
              </select>
            </div>

            <div className="grid-2 tight">
              <select className="input" value={newReg.age_category} onChange={(e) => updateNewReg('age_category', e.target.value as NewRegForm['age_category'])}>
                <option value="mayor_18">Mayor 18+</option>
                <option value="menor_con_tutor">Menor con autorización de tutor</option>
              </select>
              {newReg.modality === 'dupla' && (
                <input className="input" placeholder="Nombre de dupla / equipo" value={newReg.team_name} onChange={(e) => updateNewReg('team_name', e.target.value)} />
              )}
            </div>

            <label className="field-label">Participante 1</label>
            <input className="input" placeholder="Nombre completo" value={newReg.participant1_name} onChange={(e) => updateNewReg('participant1_name', e.target.value)} />
            <div className="grid-2 tight">
              <input className="input" inputMode="numeric" placeholder="Edad" value={newReg.participant1_age} onChange={(e) => updateNewReg('participant1_age', e.target.value.replace(/[^0-9]/g, ''))} />
              <input className="input" inputMode="tel" placeholder="WhatsApp · 10 dígitos" value={newReg.participant1_whatsapp} onChange={(e) => updateNewReg('participant1_whatsapp', e.target.value)} />
            </div>

            {newReg.modality === 'dupla' && (
              <>
                <label className="field-label">Participante 2</label>
                <input className="input" placeholder="Nombre completo" value={newReg.participant2_name} onChange={(e) => updateNewReg('participant2_name', e.target.value)} />
                <div className="grid-2 tight">
                  <input className="input" inputMode="numeric" placeholder="Edad" value={newReg.participant2_age} onChange={(e) => updateNewReg('participant2_age', e.target.value.replace(/[^0-9]/g, ''))} />
                  <input className="input" inputMode="tel" placeholder="WhatsApp · 10 dígitos" value={newReg.participant2_whatsapp} onChange={(e) => updateNewReg('participant2_whatsapp', e.target.value)} />
                </div>
              </>
            )}

            <label className="field-label">Contacto</label>
            <input className="input" type="email" placeholder="Correo de contacto" value={newReg.contact_email} onChange={(e) => updateNewReg('contact_email', e.target.value)} />
            <input className="input" placeholder="Nickname ProKicks opcional" value={newReg.nickname} onChange={(e) => updateNewReg('nickname', e.target.value)} />

            <div className="grid-2 tight">
              <select className="input" value={newReg.registration_status} onChange={(e) => updateNewReg('registration_status', e.target.value as NewRegForm['registration_status'])}>
                <option value="confirmado">Confirmado</option>
                <option value="pendiente">Pendiente</option>
              </select>
              <select className="input" value={newReg.payment_status} onChange={(e) => updateNewReg('payment_status', e.target.value as NewRegForm['payment_status'])}>
                <option value="sin_costo">Sin costo</option>
                <option value="pago_pendiente">Pago pendiente</option>
                <option value="pagado">Pagado</option>
              </select>
            </div>

            {newMsg && <p className="p">{newMsg}</p>}
            <button className="btn btn-primary btn-full" disabled={savingNew} onClick={createRegistration}>
              <Save size={16} /> {savingNew ? 'Guardando...' : 'Crear registro'}
            </button>
          </div>
        )}

        <div className="grid-2 tight">
          <button
            className="btn btn-primary"
            onClick={() => exportExcel(flat, 'prokicks_registros_torneos.xlsx')}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <FileSpreadsheet size={18} color="#21A366" /> Exportar Excel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => exportPDF(flat, 'prokicks_registros_torneos.pdf')}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <FileText size={18} color="#E13B3B" /> Exportar PDF
          </button>
        </div>
        {msg && <p className="p">{msg}</p>}

        {edit && (
          <div className="admin-edit-box">
            <div className="row">
              <h2 className="card-title">Editar registro</h2>
              <button className="btn btn-soft" onClick={() => setEdit(null)}><X size={16} /> Cancelar</button>
            </div>
            <input className="input" placeholder="Nombre" value={edit.name} onChange={(event) => updateEdit('name', event.target.value)} />
            <input className="input" type="email" placeholder="Email" value={edit.email} onChange={(event) => updateEdit('email', event.target.value)} />
            <input className="input" inputMode="tel" placeholder="WhatsApp" value={edit.whatsapp} onChange={(event) => updateEdit('whatsapp', event.target.value)} />
            <div className="grid-2 tight">
              <input className="input" placeholder="Modalidad" value={edit.modality} onChange={(event) => updateEdit('modality', event.target.value)} />
              <input className="input" placeholder="Rama / categoría" value={edit.branch} onChange={(event) => updateEdit('branch', event.target.value)} />
            </div>
            <div className="grid-2 tight">
              <input className="input" placeholder="Categoría de edad" value={edit.age_category} onChange={(event) => updateEdit('age_category', event.target.value)} />
              <input className="input" placeholder="Nombre de equipo" value={edit.team_name} onChange={(event) => updateEdit('team_name', event.target.value)} />
            </div>
            <button className="btn btn-primary btn-full" onClick={saveEdit}><Save size={16} /> Guardar cambios</button>
          </div>
        )}

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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const r = flat.find((item) => item.id === row.id);
                if (!r) return null;

                return (
                  <tr key={row.id}>
                    <td>{r.torneo}</td>
                    <td>{r.modalidad}<br /><small>{r.rama}</small></td>
                    <td>{r.participante_1}<br /><small>{r.whatsapp_1}</small></td>
                    <td>{r.participante_2 || '-'}<br /><small>{r.whatsapp_2}</small></td>
                    <td>{r.email_contacto}<br /><small>{r.whatsapp_contacto}</small></td>
                    <td>{r.costo}<br /><small>{r.payment_status}</small></td>
                    <td>Reglas: {r.reglamento_aceptado}<br />Imagen: {r.imagen_aceptada}<br /><small>Tutor: {r.requiere_tutor} {r.tutor ? `· ${r.tutor}` : ''}</small></td>
                    <td>{r.registration_status}<br /><small>{formatDateTimeEs(r.fecha)}</small></td>
                    <td>
                      <div className="admin-actions">
                        <button className="btn btn-soft" onClick={() => startEdit(row)}><Pencil size={14} /> Editar</button>
                        <button className="btn btn-soft" onClick={() => remove(row.id)}><Trash2 size={14} /> Eliminar</button>
                      </div>
                    </td>
                  </tr>
                )})}
            </tbody>
          </table>
        </div>
        {!rows.length && <p className="p">Aún no hay registros.</p>}
      </section>
    </AdminShell>
  );
}
