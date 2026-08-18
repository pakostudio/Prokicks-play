'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/monitoring';
import { trackEvent } from '@/lib/analytics';
import { isVideoUrl, mediaCategories } from '@/lib/media';
import { Share2 } from 'lucide-react';

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

function shareCaption(item: GalleryItem) {
  return `${item.title} · ProKicks Play ⚽\nMira más en prokicksplay.com`;
}

async function shareItem(item: GalleryItem) {
  const caption = shareCaption(item);
  trackEvent('Gallery Item Shared', { item_id: item.id, category: item.category });

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: item.title, text: caption, url: item.image_url });
      return;
    } catch {
      // usuario canceló o el navegador no pudo compartir; usamos el fallback
    }
  }

  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${caption}\n${item.image_url}`)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}

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
        <p className="p">Fotos y videos publicados de torneos, comunidad, spots y highlights.</p>
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
        {filtered.map((item) => {
          const video = isVideoUrl(item.image_url);
          return (
            <div key={item.id} className="media-card-wrap">
              <button className="media-card" onClick={() => setSelected(item)}>
                {video ? (
                  <video src={item.image_url} muted playsInline preload="metadata" />
                ) : (
                  <img src={item.image_url} alt={item.title} />
                )}
                <span className="tag tag-blue">{item.category || 'galería'}</span>
                <h2 className="card-title">{item.title}</h2>
                {item.description && <p className="p">{item.description}</p>}
              </button>
              <button
                className="media-share-btn"
                aria-label="Compartir"
                onClick={(event) => {
                  event.stopPropagation();
                  shareItem(item);
                }}
              >
                <Share2 size={16} />
              </button>
            </div>
          );
        })}
        {!filtered.length && <div className="card"><h2 className="card-title">Sin fotos publicadas</h2><p className="p">Las fotos y videos aparecerán aquí cuando Admin las publique.</p></div>}
      </section>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <button className="modal-close" onClick={() => setSelected(null)}>Cerrar</button>
          <div className="media-modal" onClick={(event) => event.stopPropagation()}>
            {isVideoUrl(selected.image_url) ? (
              <video src={selected.image_url} controls autoPlay playsInline />
            ) : (
              <img src={selected.image_url} alt={selected.title} />
            )}
            <h2>{selected.title}</h2>
            {selected.description && <p>{selected.description}</p>}
            <button className="btn btn-warm btn-full section" onClick={() => shareItem(selected)}>
              <Share2 size={16} /> Compartir
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
