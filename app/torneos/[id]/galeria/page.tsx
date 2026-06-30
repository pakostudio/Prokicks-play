'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

type GalleryItem = { id: string; title: string; description?: string | null; image_url: string; category?: string | null };

export default function TournamentGalleryPage() {
  const params = useParams<{ id: string }>();
  const [items, setItems] = useState<GalleryItem[]>([]);
  useEffect(() => {
    supabase.from('prokicks_gallery_items').select('id,title,description,image_url,category').eq('published', true).eq('tournament_id', params.id).order('created_at', { ascending: false }).then(({ data }) => setItems((data || []) as GalleryItem[]));
  }, [params.id]);
  return <AppShell active="torneos">
    <section className="hero section"><div className="kicker">Galería del torneo</div><h1 className="h1">Fotos del torneo</h1><p className="p">Fotos publicadas para este torneo.</p><Link className="btn btn-soft btn-full section" href={`/torneos/${params.id}`}>Volver al torneo</Link></section>
    <section className="media-grid section detail-bottom-safe">{items.map((item)=><article className="media-card" key={item.id}><img src={item.image_url} alt={item.title}/><span className="tag tag-blue">{item.category || 'foto'}</span><h2 className="card-title">{item.title}</h2>{item.description && <p className="p">{item.description}</p>}</article>)}{!items.length && <div className="card"><h2 className="card-title">Sin fotos publicadas</h2><p className="p">Aún no hay fotos de este torneo.</p></div>}</section>
  </AppShell>;
}
