'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Trophy, CalendarDays, MapPin } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

type Tournament = { id:string; title:string; description:string; city:string; venue:string; start_date:string; status:string; registration_status:string; max_players:number|null; current_players:number|null; cost:number|null };

const demo:Tournament[]=[
  { id:'demo-roma', title:'Copa ProKicks Roma Norte', description:'Torneo demo sin costo para validar comunidad y experiencia ProKicks.', city:'CDMX', venue:'ProKicks Roma Norte', start_date:'2026-07-15', status:'published', registration_status:'open', max_players:32, current_players:8, cost:0 },
  { id:'demo-polanco', title:'Reto ProKicks Polanco 1v1', description:'Formato rápido de eliminación para probar ranking y resultados.', city:'CDMX', venue:'ProKicks Polanco', start_date:'2026-07-22', status:'published', registration_status:'open', max_players:24, current_players:5, cost:0 }
];

export default function TournamentsPage(){
  const [items,setItems]=useState<Tournament[]>(demo);
  useEffect(()=>{ supabase.from('prokicks_tournaments').select('*').order('start_date').then(({data})=>{ if(data?.length) setItems(data as Tournament[]); }); },[]);
  return <AppShell active="torneos">
    <section className="hero section"><div className="kicker">Torneos ProKicks</div><h1 className="h1">Compite sin costo</h1><p className="p">Primera etapa demo: registro abierto, sin pagos, para validar experiencia con cliente.</p></section>
    <section className="list section">
      {items.map((t)=><Link key={t.id} href={`/torneos/${t.id}`} className="card tournament-card">
        <div className="row"><div className="tournament-icon"><Trophy size={20}/></div><span className="tag tag-blue">Sin costo</span></div>
        <h2 className="card-title">{t.title}</h2><p className="p">{t.description}</p>
        <div className="tournament-meta"><span><MapPin size={15}/>{t.venue}</span><span><CalendarDays size={15}/>{new Date(t.start_date).toLocaleDateString('es-MX')}</span></div>
        <div className="row"><span className="muted">Registrados: {t.current_players || 0}{t.max_players ? ` / ${t.max_players}` : ''}</span><span className="tag tag-warm">Registro abierto</span></div>
      </Link>)}
    </section>
  </AppShell>
}
