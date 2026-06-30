'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/monitoring';
import { mediaCategories } from '@/lib/media';

type GalleryItem = {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  category?: string | null;
  tournament_id?: string | null;
  published?: boolean | null;
  created_at?: string | null;
};

export default function GaleriaPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [category, setCategory] = useState('todas');
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('prokicks_gallery_items')
        .select('id,title,description,image_url,category,tournament_id,published,created_at')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        captureError(error, { area: 'gallery-public-select' });
        setMsg('La galería se está preparando.');
        return;
      }

      setItems((data || []) as GalleryItem[]);
    }

    load();
  }, []);

  const filtered = useMemo(() => (
    category === 'todas' ? items : items.filter((item) => item.category === category)
  ), [category, items]);

  return (
    <AppShell active="play">
      <section className="hero section">
        <div className="kicker">Galería</div>
        <h1 className="h1">Galería ProKicks</h1>
        <p className="p">Fotos publicadas de torneos, comunidad, spots y highlights.</p>
      </section>

      <section className="media-filters section">
        {['todas', ...mediaCategories].map((item) => (
          <button key={item} className={`tag ${category === item ? 'tag-blue' : ''}`} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </section>

      {msg && <div className="alert warn section">{msg}</div>}

      <section className="media-grid section detail-bottom-safe">
        {filtered.map((item) => (
          <button key={item.id} className="media-card" onClick={() => setSelected(item)}>
            <img src={item.image_url} alt={item.title} />
            <span className="tag tag-blue">{item.category || 'galería'}</span>
            <h2 className="card-title">{item.title}</h2>
            {item.description && <p className="p">{item.description}</p>}
          </button>
        ))}
        {!filtered.length && <div className="card"><h2 className="card-title">Sin fotos publicadas</h2><p className="p">Las fotos aparecerán aquí cuando Admin las publique.</p></div>}
      </section>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <button className="modal-close" onClick={() => setSelected(null)}>Cerrar</button>
          <div className="media-modal" onClick={(event) => event.stopPropagation()}>
            <img src={selected.image_url} alt={selected.title} />
            <h2>{selected.title}</h2>
            {selected.description && <p>{selected.description}</p>}
          </div>
        </div>
      )}
    </AppShell>
  );
}
