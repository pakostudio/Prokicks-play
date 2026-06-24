'use client';
import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { demoSpots } from '@/lib/demo';

export default function NewChallenge(){
  const [title,setTitle]=useState('Reta rápida');
  const [spot,setSpot]=useState(demoSpots[0].id);
  const [type,setType]=useState('1v1');
  const [level,setLevel]=useState('intermedio');
  const [msg,setMsg]=useState('');
  async function create(){
    const { data:userData } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('challenges').insert({ title, spot_id:spot, type, level, status:'open', creator_id:userData.user?.id || null, scheduled_at:new Date().toISOString() }).select().single();
    if(error){ setMsg(error.message); return; }
    window.location.href = `/retas/${data.id}`;
  }
  return <AppShell active="retas">
    <section className="hero section"><div className="kicker">Nueva reta</div><h1 className="h1">Activa el juego</h1></section>
    <section className="card form section">
      <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nombre de la reta" />
      <select className="input" value={spot} onChange={e=>setSpot(e.target.value)}>{demoSpots.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <select className="input" value={type} onChange={e=>setType(e.target.value)}><option>1v1</option><option>2v2</option><option>3v3</option></select>
      <select className="input" value={level} onChange={e=>setLevel(e.target.value)}><option>principiante</option><option>intermedio</option><option>avanzado</option></select>
      {msg && <div className="alert error">{msg}</div>}
      <button className="btn btn-primary" onClick={create}>Crear reta</button>
    </section>
  </AppShell>
}
