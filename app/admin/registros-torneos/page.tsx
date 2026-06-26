'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

type Registration = { id:string; tournament_id:string; user_id:string|null; player_name:string|null; player_email:string|null; nickname:string|null; status:string; created_at:string; tournament?:{title:string}|null };
function toCSV(rows:any[]){
  if(!rows.length) return '';
  const headers = Array.from(new Set(rows.flatMap(r=>Object.keys(r))));
  const esc = (v:any)=>`"${String(v ?? '').replace(/"/g,'""')}"`;
  return [headers.join(','), ...rows.map(r=>headers.map(h=>esc(r[h])).join(','))].join('\n');
}
function download(filename:string, content:string){
  const blob = new Blob([content], { type:'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
}
export default function AdminRegistrosTorneosPage(){
  const [rows,setRows]=useState<Registration[]>([]);
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState('');
  const flat = useMemo(()=>rows.map(r=>({
    id:r.id, torneo:r.tournament?.title || r.tournament_id, nombre:r.player_name, email:r.player_email, nickname:r.nickname, status:r.status, fecha:r.created_at
  })),[rows]);
  async function load(){
    setLoading(true);
    const { data, error } = await supabase.from('prokicks_tournament_registrations').select('*, tournament:prokicks_tournaments(title)').order('created_at', { ascending:false });
    if(error) setMsg(error.message);
    setRows((data || []) as Registration[]);
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);
  return <AppShell active="perfil">
    <section className="hero section"><div className="kicker">Admin · Registros</div><h1 className="h1">Registros a torneos</h1><p className="p">Consulta participantes registrados a torneos demo sin costo.</p></section>
    <section className="card form section">
      <div className="row"><strong>{loading ? 'Cargando...' : `${rows.length} registros`}</strong><button className="btn btn-soft" onClick={load}>Actualizar</button></div>
      <button className="btn btn-primary btn-full" onClick={()=>download('prokicks_registros_torneos.csv', toCSV(flat))}><Download size={16}/> Exportar registros CSV</button>
      {msg && <p className="p">{msg}</p>}
      <div className="table-wrap">
        <table className="admin-table"><thead><tr><th>Torneo</th><th>Jugador</th><th>Email</th><th>Nickname</th><th>Estatus</th></tr></thead><tbody>
          {flat.map(r=><tr key={r.id}><td>{r.torneo}</td><td>{r.nombre}</td><td>{r.email}</td><td>{r.nickname}</td><td>{r.status}</td></tr>)}
        </tbody></table>
      </div>
      {!rows.length && <p className="p">Aún no hay registros.</p>}
    </section>
    <section className="section"><Link className="btn btn-soft btn-full" href="/admin">Volver a Admin</Link></section>
  </AppShell>
}
