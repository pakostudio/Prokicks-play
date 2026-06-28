'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

type Challenge = {
  id: string;
  title: string;
  spot_name?: string | null;
  spot_code?: string | null;
  creator_nickname?: string | null;
  type?: string | null;
  status?: string | null;
};

export default function RetaDetail({ params }:{ params:{ id:string }}){
  const [reta,setReta]=useState<Challenge | null>(null);

  useEffect(()=>{
    supabase.from('prokicks_challenges').select('*').eq('id', params.id).maybeSingle().then(({data})=>setReta(data as Challenge | null));
  },[params.id]);

  return <AppShell active="retas">
    <section className="hero section"><div className="kicker">Detalle de reta</div><h1 className="h1">{reta?.title || 'Reta no encontrada'}</h1><p className="p">{reta ? `${reta.spot_name} · ${reta.spot_code}` : 'Esta reta no existe o ya no está abierta.'}</p></section>
    {reta && <><section className="grid-2 section">
      <div className="stat"><span className="muted">Estado</span><strong style={{fontSize:18}}>{reta.status || 'Abierta'}</strong></div>
      <div className="stat"><span className="muted">Formato</span><strong>{reta.type || 'abierto'}</strong></div>
    </section>
    <section className="card section"><h2 className="card-title">Creador</h2><p className="p">{reta.creator_nickname || 'Jugador ProKicks'}</p></section></>}
    <section className="grid section">
      {reta && <button className="btn btn-warm btn-full">Unirme</button>}
      <Link className="btn btn-soft btn-full" href="/retas">Volver</Link>
    </section>
  </AppShell>
}
