'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { supabase } from '@/lib/supabase';

type TableKey = 'profiles' | 'tournaments' | 'registrations' | 'consents' | 'guardian';
const tables: Record<TableKey, { label:string; table:string }> = {
  profiles: { label:'Usuarios / perfiles', table:'prokicks_profiles' },
  tournaments: { label:'Torneos', table:'prokicks_tournaments' },
  registrations: { label:'Registros a torneos', table:'prokicks_tournament_registrations' },
  consents: { label:'Consentimientos de usuarios', table:'prokicks_user_consents' },
  guardian: { label:'Consentimientos de tutores', table:'prokicks_guardian_consents' }
};

function download(filename:string, content:string, type:string){
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}
function toCSV(rows:any[]){
  if(!rows.length) return '';
  const headers = Array.from(new Set(rows.flatMap((r)=>Object.keys(r))));
  const esc = (v:any)=>`"${String(v ?? '').replace(/"/g,'""')}"`;
  return [headers.join(','), ...rows.map((r)=>headers.map((h)=>esc(r[h])).join(','))].join('\n');
}
function toXLS(rows:any[]){
  const headers = rows.length ? Array.from(new Set(rows.flatMap((r)=>Object.keys(r)))) : [];
  return `<html><body><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${headers.map(h=>`<td>${String(r[h] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
}

export default function ExportPage(){
  const [selected,setSelected]=useState<TableKey>('profiles');
  const [rows,setRows]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  const cfg = tables[selected];
  const count = useMemo(()=>rows.length,[rows]);
  async function load(){
    setLoading(true);
    const { data } = await supabase.from(cfg.table).select('*').limit(1000);
    setRows(data || []);
    setLoading(false);
  }
  useEffect(()=>{ load(); },[selected]);
  function exportCSV(){ download(`${cfg.table}.csv`, toCSV(rows), 'text/csv;charset=utf-8'); }
  function exportXLS(){ download(`${cfg.table}.xls`, toXLS(rows), 'application/vnd.ms-excel'); }
  function exportPDF(){
    const csv = toCSV(rows).replace(/\n/g,'<br/>');
    const w = window.open('', '_blank');
    if(!w) return;
    w.document.write(`<html><head><title>${cfg.label}</title><style>body{font-family:Arial;padding:24px;color:#1F2937} h1{color:#173B63} .data{font-size:11px;line-height:1.5;word-break:break-all}</style></head><body><h1>${cfg.label}</h1><p>Total registros: ${count}</p><div class="data">${csv}</div><script>window.print()</script></body></html>`);
    w.document.close();
  }
  return <AdminShell active="dashboard">
    <section className="hero section"><div className="kicker">Admin · Exportación</div><h1 className="h1">Base de datos</h1><p className="p">Exporta información operativa en CSV, Excel o PDF para revisión con cliente.</p></section>
    <section className="card form section">
      <select className="input" value={selected} onChange={(e)=>setSelected(e.target.value as TableKey)}>{Object.entries(tables).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
      <div className="row"><strong>{loading ? 'Cargando...' : `${count} registros`}</strong><button className="btn btn-soft" onClick={load}>Actualizar</button></div>
      <div className="grid">
        <button className="btn btn-primary" onClick={exportCSV}><Download size={18}/> Exportar CSV</button>
        <button className="btn btn-soft" onClick={exportXLS}><FileSpreadsheet size={18}/> Exportar Excel</button>
        <button className="btn btn-soft" onClick={exportPDF}><FileText size={18}/> Exportar PDF</button>
      </div>
    </section>
    <section className="section"><Link className="btn btn-soft btn-full" href="/admin">Volver a Admin</Link></section>
  </AdminShell>
}
