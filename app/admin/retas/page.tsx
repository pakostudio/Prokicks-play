'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { demoChallenges } from '@/lib/demo';
import { supabase } from '@/lib/supabase';

type Challenge = {
  id: string;
  title: string;
  spot_name?: string | null;
  spot_code?: string | null;
  creator_name?: string | null;
  creator_nickname?: string | null;
  creator_avatar_id?: string | null;
  type?: string | null;
  status?: string | null;
  scheduled_at?: string | null;
  created_at?: string | null;
};

export default function AdminRetas(){
  const [rows,setRows]=useState<Challenge[]>(demoChallenges);
  const [msg,setMsg]=useState('');

  async function load(){
    const { data, error } = await supabase.from('prokicks_challenges').select('*').order('created_at', { ascending:false }).limit(50);
    const localRaw = window.localStorage.getItem('prokicks_last_challenge');
    const local = localRaw ? JSON.parse(localRaw) : null;
    if (error) setMsg('Retas en Supabase pendientes de SQL/policies. Mostrando datos de presentación.');
    setRows([...(local ? [local] : []), ...((data?.length ? data : demoChallenges) as Challenge[])]);
  }

  useEffect(()=>{ load(); },[]);

  return <AppShell active="perfil">
    <section className="hero section"><div className="kicker">Admin</div><h1 className="h1">Retas creadas</h1><p className="p">Vista rápida para presentación: spot, creador, nickname y estado.</p></section>
    <section className="card form section">
      <div className="row"><strong>{rows.length} retas</strong><button className="btn btn-soft" onClick={load}>Actualizar</button></div>
      {msg && <div className="alert warn">{msg}</div>}
      <div className="table-wrap"><table className="admin-table"><thead><tr><th>Reta</th><th>Spot</th><th>Creador</th><th>Tipo</th><th>Estado</th></tr></thead><tbody>
        {rows.map((row)=><tr key={row.id}><td>{row.title}</td><td>{row.spot_name}<br/><small>{row.spot_code}</small></td><td>{row.creator_name || '-'}<br/><small>{row.creator_nickname || row.creator_avatar_id || ''}</small></td><td>{row.type || '-'}</td><td>{row.status || 'abierta'}</td></tr>)}
      </tbody></table></div>
    </section>
    <section className="section"><Link className="btn btn-soft btn-full" href="/admin">Volver a Admin</Link></section>
  </AppShell>
}
