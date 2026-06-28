'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Trophy, CalendarDays, MapPin } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { indoorTournament } from '@/lib/demo';

type Tournament = { id:string; title:string; description:string|null; city:string|null; state:string|null; format:string|null; level:string|null; status:string|null; starts_at:string|null; capacity:number|null; is_free:boolean|null; cost?:number|null; currency?:string|null };

const fallbackTournaments:Tournament[]=[indoorTournament as Tournament];

function costLabel(t:Tournament){
  if(t.is_free !== false || !Number(t.cost || 0)) return 'Sin costo';
  return new Intl.NumberFormat('es-MX', { style:'currency', currency:t.currency || 'MXN' }).format(Number(t.cost || 0));
}

export default function TournamentsPage(){
  const [items,setItems]=useState<Tournament[]>(fallbackTournaments);
  useEffect(()=>{ supabase.from('prokicks_tournaments').select('*').ilike('title', '%Indoor Community%').order('starts_at', { ascending:true }).then(({data})=>{ if(data?.length) setItems(data as Tournament[]); }); },[]);
  return <AppShell active="torneos">
    <section className="hero section"><div className="kicker">Torneos ProKicks</div><h1 className="h1">Indoor Community</h1><p className="p">17 de julio · Av. Toluca 481 · registro abierto.</p></section>
    <section className="list section tournaments-list-safe">
      {items.map((t)=><Link key={t.id} href={`/torneos/${t.id}`} className="card tournament-card">
        <div className="row"><div className="tournament-icon"><Trophy size={20}/></div><span className={t.is_free === false ? 'tag tag-warm' : 'tag tag-blue'}>{costLabel(t)}</span></div>
        <h2 className="card-title">{t.title}</h2><p className="p">{t.description}</p>
        <div className="tournament-meta"><span><MapPin size={15}/>{t.city || 'CDMX'}</span><span><CalendarDays size={15}/>{t.starts_at ? new Date(t.starts_at).toLocaleDateString('es-MX') : 'Fecha por confirmar'}</span></div>
        <div className="row"><span className="muted">Cupo: {t.capacity || 'Por definir'}</span><span className="tag tag-warm">{t.status === 'open' ? 'Registrarme' : t.status}</span></div>
      </Link>)}
    </section>
  </AppShell>
}
