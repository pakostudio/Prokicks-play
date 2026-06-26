'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, Trophy } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

export default function TournamentRegistration(){
  const params = useParams<{ id:string }>();
  const tournamentId = params.id;
  const [form,setForm]=useState({ name:'', email:'', nickname:'' });
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  function update(k:string,v:string){ setForm(prev=>({...prev,[k]:v})); }
  async function submit(){
    setLoading(true); setMessage('');
    const { error } = await supabase.from('prokicks_tournament_registrations').insert({
      tournament_id: tournamentId?.startsWith('demo-') ? null : tournamentId,
      user_id: null,
      player_name: form.name,
      player_email: form.email,
      nickname: form.nickname,
      status: 'registered'
    });
    setLoading(false);
    setMessage(error ? error.message : 'Registro recibido. Esta primera etapa no tiene costo.');
  }
  return <AppShell active="torneos">
    <Link href={`/torneos/${tournamentId}`} className="back-link"><ChevronLeft size={18}/> Volver</Link>
    <section className="hero section"><div className="kicker">Registro a torneo</div><h1 className="h1">Aparta tu lugar</h1><p className="p">Primera etapa demo: sin costo y sin pago en línea.</p></section>
    <section className="card form section">
      <div className="card-head"><Trophy/><div><h2>Datos de registro</h2><p>Usaremos estos datos para confirmar tu participación.</p></div></div>
      <input className="input" placeholder="Nombre completo" value={form.name} onChange={(e)=>update('name',e.target.value)} />
      <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e)=>update('email',e.target.value)} />
      <input className="input" placeholder="Nickname ProKicks" value={form.nickname} onChange={(e)=>update('nickname',e.target.value)} />
      {message && <div className="alert ok">{message}</div>}
      <button className="btn btn-primary" disabled={loading || !form.name || !form.email} onClick={submit}>{loading?'Registrando...':'Confirmar registro sin costo'}</button>
    </section>
  </AppShell>
}
