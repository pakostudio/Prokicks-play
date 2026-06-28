'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { demoChallenges } from '@/lib/demo';
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
  const [items,setItems]=useState<Challenge[]>(demoChallenges);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('prokicks_challenges').select('*').order('created_at', { ascending: false }).limit(12);
      const localRaw = window.localStorage.getItem('prokicks_last_challenge');
      const local = localRaw ? JSON.parse(localRaw) : null;
      const merged = [...(local ? [local] : []), ...((data?.length ? data : demoChallenges) as Challenge[])];
      setItems(merged);
    }
    load();
  }, []);

  return <AppShell active="retas">
    <section className="hero section"><div className="kicker">Retas</div><h1 className="h1">Compite cerca</h1><p className="p">Crea una reta conectada a un spot real.</p></section>
    <Link className="btn btn-primary btn-full section" href="/retas/nueva">Crear nueva reta</Link>
    <section className="list section">
      {items.map(c=><Link className="card" href={`/retas/${c.id}`} key={c.id}>
        <div className="row"><h3 className="card-title">{c.title}</h3><span className="tag tag-warm">{c.status || 'abierta'}</span></div>
        <p className="p">{c.spot_name} · {c.spot_code} · {c.type}</p>
        {c.creator_nickname && <p className="p">Creador: {c.creator_nickname}</p>}
      </Link>)}
    </section>
  </AppShell>
}
