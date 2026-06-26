'use client';
import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

export default function OnboardingPage() {
  const [displayName,setDisplayName]=useState('');
  const [alias,setAlias]=useState('');
  const [city,setCity]=useState('CDMX');
  const [level,setLevel]=useState('principiante');
  const [msg,setMsg]=useState('');

  async function save(){
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if(!user){ setMsg('Primero inicia sesión.'); return; }
    const { error } = await supabase.from('prokicks_profiles').upsert({ id:user.id, display_name:displayName, alias, city, level });
    if(error) setMsg(error.message); else window.location.href='/';
  }

  return <AppShell active="perfil">
    <section className="hero section"><div className="kicker">Perfil</div><h1 className="h1">Crea tu jugador</h1><p className="p">Datos mínimos para retas y ranking.</p></section>
    <section className="card form section">
      <input className="input" placeholder="Nombre" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
      <input className="input" placeholder="Alias" value={alias} onChange={e=>setAlias(e.target.value)} />
      <input className="input" placeholder="Ciudad" value={city} onChange={e=>setCity(e.target.value)} />
      <select className="input" value={level} onChange={e=>setLevel(e.target.value)}><option>principiante</option><option>intermedio</option><option>avanzado</option></select>
      {msg && <div className="alert error">{msg}</div>}
      <button className="btn btn-primary" onClick={save}>Guardar perfil</button>
    </section>
  </AppShell>
}
