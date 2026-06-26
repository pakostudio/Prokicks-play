'use client';
import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

export default function ResultPage(){
  const [scoreA,setScoreA]=useState(10);
  const [scoreB,setScoreB]=useState(7);
  const [msg,setMsg]=useState('');
  async function save(){
    const params = new URLSearchParams(window.location.search);
    const challenge_id = params.get('challenge');
    const { error } = await supabase.from('prokicks_results').insert({ challenge_id, team_a_score:scoreA, team_b_score:scoreB, winner_team: scoreA >= scoreB ? 'A':'B' });
    if(error){ setMsg(error.message); return; }
    setMsg('Resultado registrado. Ranking básico listo para siguiente cálculo real.');
  }
  return <AppShell active="retas">
    <section className="hero section"><div className="kicker">Resultado</div><h1 className="h1">Registra marcador</h1></section>
    <section className="card form section">
      <label>Equipo A<input className="input" type="number" value={scoreA} onChange={e=>setScoreA(Number(e.target.value))}/></label>
      <label>Equipo B<input className="input" type="number" value={scoreB} onChange={e=>setScoreB(Number(e.target.value))}/></label>
      {msg && <div className={msg.includes('registrado') ? 'alert ok' : 'alert error'}>{msg}</div>}
      <button className="btn btn-primary" onClick={save}>Guardar resultado</button>
    </section>
  </AppShell>
}
