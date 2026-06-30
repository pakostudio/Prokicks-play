'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/monitoring';
import { mediaCategories, YOUTUBE_CHANNEL_URL } from '@/lib/media';

type VideoItem = {
  id: string;
  title: string;
  description?: string | null;
  embed_url: string;
  youtube_url: string;
  category?: string | null;
  published?: boolean | null;
};

export default function VideosPage() {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [category, setCategory] = useState('todas');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('prokicks_videos')
        .select('id,title,description,embed_url,youtube_url,category,published')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        captureError(error, { area: 'videos-public-select' });
        setMsg('Los videos se están preparando.');
        return;
      }

      setItems((data || []) as VideoItem[]);
    }

    load();
  }, []);

  const filtered = useMemo(() => category === 'todas' ? items : items.filter((item) => item.category === category), [category, items]);

  return (
    <AppShell active="play">
      <section className="hero section"><div className="kicker">Videos</div><h1 className="h1">Videos ProKicks</h1><p className="p">Highlights, comunidad y contenido oficial desde YouTube.</p><Link className="btn btn-soft btn-full section" href={YOUTUBE_CHANNEL_URL} target="_blank">Ver canal oficial</Link></section>
      <section className="media-filters section">
        {['todas', ...mediaCategories].map((item) => <button key={item} className={`tag ${category === item ? 'tag-blue' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}
      </section>
      {msg && <div className="alert warn section">{msg}</div>}
      <section className="grid section detail-bottom-safe">
        {filtered.map((item) => (
          <article className="card video-card" key={item.id}>
            <iframe src={item.embed_url} title={item.title} allowFullScreen loading="lazy" />
            <span className="tag tag-blue">{item.category || 'video'}</span>
            <h2 className="card-title">{item.title}</h2>
            {item.description && <p className="p">{item.description}</p>}
          </article>
        ))}
        {!filtered.length && <div className="card"><h2 className="card-title">Sin videos publicados</h2><p className="p">Los videos aparecerán aquí cuando Admin los publique.</p></div>}
      </section>
    </AppShell>
  );
}
