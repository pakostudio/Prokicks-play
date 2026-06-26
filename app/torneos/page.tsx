'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Trophy, CalendarDays, MapPin } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

type Tournament = { id:string; title:string; description:string|null; city:string|null; state:string|null; format:string|null; level:string|null; status:string|null; starts_at:string|null; capacity:number|null; is_free:boolean|null };

const demo:Tournament[]=[
  { id:'demo-roma', title:'ProKicks Open Roma Norte', description:'Torneo demo sin costo para validar comunidad y experiencia ProKicks.', city:'CDMX', state:'Ciudad de México', starts_at:new Date(Date.now()+7*86400000).toISOString(), status:'open', format:'1v1', level:'abierto', capacity:32, is_free:true },
  { id:'demo-polanco', title:'Duplas ProKicks Polanco', description:'Formato 2v2 para probar registro, equipos y resultados.', city:'CDMX', state:'Ciudad de México', starts_at:new Date(Date.now()+10*86400000).toISOString(), status:'open', format:'2v2', level:'intermedio', capacity:24, is_free:true }
];

export default function TournamentsPage(){
  const [items,setItems]=useState<Tournament[]>(demo);
  useEffect(()=>{ supabase.from('prokicks_tournaments').select('*').order('starts_at', { ascending:true }).then(({data})=>{ if(data?.length) setItems(data as Tournament[]); }); },[]);
  return <AppShell active="torneos">
    <section className="hero section"><div className="kicker">Torneos ProKicks</div><h1 className="h1">Compite sin costo</h1><p className="p">Primera etapa demo: registro abierto, sin pagos, para validar experiencia con cliente.</p></section>
    <section className="list section">
      {items.map((t)=><Link key={t.id} href={`/torneos/${t.id}`} className="card tournament-card">
        <div className="row"><div className="tournament-icon"><Trophy size={20}/></div><span className="tag tag-blue">Sin costo</span></div>
        <h2 className="card-title">{t.title}</h2><p className="p">{t.description}</p>
        <div className="tournament-meta"><span><MapPin size={15}/>{t.city || 'CDMX'}</span><span><CalendarDays size={15}/>{t.starts_at ? new Date(t.starts_at).toLocaleDateString('es-MX') : 'Fecha por confirmar'}</span></div>
        <div className="row"><span className="muted">Cupo: {t.capacity || 'Por definir'}</span><span className="tag tag-warm">{t.status === 'open' ? 'Registro abierto' : t.status}</span></div>
      </Link>)}
    </section>
  </AppShell>
}
