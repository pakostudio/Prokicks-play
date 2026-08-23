'use client';

import { useEffect, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { supabase } from '@/lib/supabase';
import { formatDateTimeEs } from '@/lib/format';

type Interest = {
  id: string;
  name: string;
  email: string | null;
  whatsapp: string | null;
  age: string | null;
  notes: string | null;
  status: string | null;
  created_at: string;
};

export default function AdminClinicasPage() {
  const [rows, setRows] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    setMsg('');
    const { data, error } = await supabase
      .from('prokicks_clinic_interest')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setMsg(error.message);
    setRows((data || []) as Interest[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function exportExcel() {
    if (!rows.length) return;
    const XLSX = await import('xlsx');
    const data = rows.map((r) => ({
      Nombre: r.name,
      WhatsApp: r.whatsapp || '',
      Email: r.email || '',
      Edad: r.age || '',
      Notas: r.notes || '',
      Registrado: formatDateTimeEs(r.created_at),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clinicas');
    XLSX.writeFile(wb, `prokicks-clinicas-interes-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <AdminShell active="clinicas">
      <section className="hero section">
        <div className="kicker">Admin · Clínicas</div>
        <h1 className="h1">Lista de interés · Clínicas</h1>
        <p className="p">Jugadores que se anotaron para que les avisemos de la próxima clínica de técnica individual.</p>
      </section>
      <section className="card form section">
        <div className="row">
          <strong>{loading ? 'Cargando...' : `${rows.length} registros`}</strong>
          <div className="admin-actions">
            <button className="btn btn-soft" onClick={load}>Actualizar</button>
            <button className="btn btn-primary" onClick={exportExcel} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FileSpreadsheet size={16} /> Exportar Excel
            </button>
          </div>
        </div>
        {msg && <p className="p">{msg}</p>}
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>WhatsApp</th>
                <th>Email</th>
                <th>Edad</th>
                <th>Notas</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.whatsapp || '-'}</td>
                  <td>{r.email || '-'}</td>
                  <td>{r.age || '-'}</td>
                  <td>{r.notes || '-'}</td>
                  <td>{formatDateTimeEs(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <p className="p">Aún no hay nadie anotado.</p>}
      </section>
    </AdminShell>
  );
}
