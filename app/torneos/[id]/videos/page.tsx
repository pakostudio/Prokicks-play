'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

type VideoItem = { id: string; title: string; description?: string | null; embed_url: string; category?: string | null };

export default function TournamentVideosPage() {
  const params = useParams<{ id: string }>();
  const [items, setItems] = useState<VideoItem[]>([]);
  useEffect(() => {
    supabase.from('prokicks_videos').select('id,title,description,embed_url,category').eq('published', true).eq('tournament_id', params.id).order('created_at', { ascending: false }).then(({ data }) => setItems((data || []) as VideoItem[]));
  }, [params.id]);
  return <AppShell active="torneos">
    <section className="hero section"><div className="kicker">Videos del torneo</div><h1 className="h1">Videos del torneo</h1><p className="p">Videos publicados para este torneo.</p><Link className="btn btn-soft btn-full section" href={`/torneos/${params.id}`}>Volver al torneo</Link></section>
    <section className="grid section detail-bottom-safe">{items.map((item)=><article className="card video-card" key={item.id}><iframe src={item.embed_url} title={item.title} allowFullScreen loading="lazy" /><span className="tag tag-blue">{item.category || 'video'}</span><h2 className="card-title">{item.title}</h2>{item.description && <p className="p">{item.description}</p>}</article>)}{!items.length && <div className="card"><h2 className="card-title">Sin videos publicados</h2><p className="p">Aún no hay videos de este torneo.</p></div>}</section>
  </AppShell>;
}
