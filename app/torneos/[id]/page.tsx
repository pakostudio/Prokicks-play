'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CalendarDays, MapPin, Trophy, Users } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

type Tournament = { id:string; title:string; description:string; city:string; venue:string; start_date:string; format:string|null; status:string; registration_status:string; max_players:number|null; current_players:number|null; cost:number|null };

const demo:Tournament = { id:'demo-roma', title:'Copa ProKicks Roma Norte', description:'Torneo demo sin costo para validar comunidad y experiencia ProKicks.', city:'CDMX', venue:'ProKicks Roma Norte', start_date:'2026-07-15', format:'1v1 / fase rápida', status:'published', registration_status:'open', max_players:32, current_players:8, cost:0 };

export default function TournamentDetail(){
  const params = useParams<{ id:string }>();
  const tournamentId = params.id;
  const [item,setItem]=useState<Tournament>({...demo, id: tournamentId || demo.id});
  useEffect(()=>{ if(tournamentId && !tournamentId.startsWith('demo-')) supabase.from('prokicks_tournaments').select('*').eq('id', tournamentId).maybeSingle().then(({data})=>{ if(data) setItem(data as Tournament); }); },[tournamentId]);
  return <AppShell active="torneos">
    <section className="hero section tournament-hero"><div className="kicker">Torneo demo · Sin costo</div><h1 className="h1">{item.title}</h1><p className="p">{item.description}</p><Link href={`/torneos/${item.id}/registro`} className="btn btn-primary btn-full section">Registrarme al torneo</Link></section>
    <section className="grid section">
      <div className="card"><div className="row"><MapPin color="#173B63"/><div><h3 className="card-title">Sede</h3><p className="p">{item.venue} · {item.city}</p></div></div></div>
      <div className="card"><div className="row"><CalendarDays color="#173B63"/><div><h3 className="card-title">Fecha</h3><p className="p">{new Date(item.start_date).toLocaleDateString('es-MX')}</p></div></div></div>
      <div className="card"><div className="row"><Trophy color="#173B63"/><div><h3 className="card-title">Formato</h3><p className="p">{item.format || 'Formato demo por confirmar'}</p></div></div></div>
      <div className="card"><div className="row"><Users color="#173B63"/><div><h3 className="card-title">Cupo</h3><p className="p">{item.current_players || 0}{item.max_players ? ` / ${item.max_players}` : ''} registrados</p></div></div></div>
    </section>
  </AppShell>
}
