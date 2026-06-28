'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Trophy, CalendarDays, MapPin } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { indoorTournament } from '@/lib/demo';

type Tournament = {
  id:string;
  title:string;
  description:string|null;
  city:string|null;
  state:string|null;
  format:string|null;
  level:string|null;
  status:string|null;
  starts_at:string|null;
  capacity:number|null;
  is_free:boolean|null;
  cost?:number|null;
  currency?:string|null;
  venue?:string|null;
  address?:string|null;
  maps_url?:string|null;
};

const fallbackTournaments:Tournament[]=[indoorTournament as Tournament];

function costLabel(t:Tournament){
  if(t.is_free !== false || !Number(t.cost || 0)) return 'Sin costo';
  return new Intl.NumberFormat('es-MX', { style:'currency', currency:t.currency || 'MXN' }).format(Number(t.cost || 0));
}

function dateLabel(value:string|null){
  if(!value) return 'Fecha por confirmar';
  return new Date(value).toLocaleDateString('es-MX');
}

function tournamentFlyer(t:Tournament){
  const raw = `${t.title || ''} ${t.venue || ''} ${t.address || ''}`.toLowerCase();
  if(raw.includes('barra') || raw.includes('tlatelolco') || raw.includes('peralvillo')) return '/tournaments/torneo-la-barra-2026.jpeg';
  if(raw.includes('indoor') || raw.includes('altolivo')) return '/tournaments/torneo-inaugural-prokicks-2026.png';
  return '';
}

export default function TournamentsPage(){
  const [items,setItems]=useState<Tournament[]>(fallbackTournaments);

  async function load(){
    const { data, error } = await supabase
      .from('prokicks_tournaments')
      .select('*')
      .in('status', ['open','draft','full','in_progress'])
      .order('starts_at', { ascending:true });

    if(!error && data?.length){
      setItems(data as Tournament[]);
    }
  }

  useEffect(()=>{ load(); },[]);

  return <AppShell active="torneos">
    <section className="hero section">
      <div className="kicker">Torneos ProKicks</div>
      <h1 className="h1">Torneos disponibles</h1>
      <p className="p">Consulta próximos torneos, sede, cupo y registro.</p>
    </section>

    <section className="list section tournaments-list-safe">
      {items.map((t)=><Link key={t.id} href={`/torneos/${t.id}`} className="card tournament-card">
        <div className="row">
          <div className="tournament-icon"><Trophy size={20}/></div>
          <span className={t.is_free === false ? 'tag tag-warm' : 'tag tag-blue'}>{costLabel(t)}</span>
        </div>
        {tournamentFlyer(t) && <div className="tournament-card-flyer"><Image src={tournamentFlyer(t)} alt={t.title} width={600} height={800} /></div>}
        <h2 className="card-title">{t.title}</h2>
        <p className="p">{t.description}</p>
        <div className="tournament-meta">
          <span><MapPin size={15}/>{t.venue || t.city || 'CDMX'}</span>
          <span><CalendarDays size={15}/>{dateLabel(t.starts_at)}</span>
        </div>
        <div className="row">
          <span className="muted">Cupo: {t.capacity || 'Por definir'}</span>
          <span className="tag tag-warm">{t.status === 'open' ? 'Registrarme' : t.status}</span>
        </div>
      </Link>)}
    </section>
  </AppShell>
}
