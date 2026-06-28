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
  type?: string | null;
  status?: string | null;
  creator_nickname?: string | null;
  scheduled_at?: string | null;
};

export default function RetasPage(){
  const [items,setItems]=useState<Challenge[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('prokicks_challenges').select('*').order('created_at', { ascending: false }).limit(12);
      setItems((data || []) as Challenge[]);
    }
    load();
  }, []);

  return <AppShell active="retas">
    <section className="hero section"><div className="kicker">Retas</div><h1 className="h1">Compite cerca</h1><p className="p">Crea una reta conectada a un spot real.</p></section>
    <Link className="btn btn-primary btn-full section" href="/retas/nueva">Crear nueva reta</Link>
    <section className="list section">
      {items.map(c=><article className="card challenge-card" key={c.id}>
        <div className="row"><h3 className="card-title">{c.title}</h3><span className="tag tag-warm">{c.status || 'abierta'}</span></div>
        <p className="p">{c.spot_name} · {c.spot_code} · formato {c.type}</p>
        {c.creator_nickname && <p className="p">Creador: {c.creator_nickname}</p>}
        <div className="grid-2">
          <Link className="btn btn-soft" href={`/retas/${c.id}`}>Ver reta</Link>
          <Link className="btn btn-primary" href={`/retas/${c.id}`}>Unirme</Link>
        </div>
      </article>)}
      {!items.length && <section className="card"><h3 className="card-title">Aún no hay retas abiertas</h3><p className="p">Escanea un spot y crea la primera reta.</p><Link className="btn btn-primary btn-full section" href="/scan">Conectar spot</Link></section>}
    </section>
  </AppShell>
}
