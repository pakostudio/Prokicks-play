'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/monitoring';
import { mediaCategories, youtubeEmbedUrl, youtubeThumbnailUrl, youtubeVideoId } from '@/lib/media';

type Tournament = { id: string; title: string };
type VideoItem = {
  id?: string;
  title: string;
  description: string;
  youtube_url: string;
  youtube_video_id: string;
  embed_url: string;
  thumbnail_url: string;
  tournament_id: string;
  category: string;
  published: boolean;
  sort_order: number;
};

const empty: VideoItem = {
  title: '',
  description: '',
  youtube_url: '',
  youtube_video_id: '',
  embed_url: '',
  thumbnail_url: '',
  tournament_id: '',
  category: 'highlight',
  published: true,
  sort_order: 0,
};

export default function AdminVideosPage() {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [form, setForm] = useState<VideoItem>(empty);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const editing = Boolean(form.id);
  const sorted = useMemo(() => items.slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)), [items]);

  async function load() {
    setLoading(true);
    const [{ data, error }, tournamentResult] = await Promise.all([
      supabase.from('prokicks_videos').select('*').order('created_at', { ascending: false }),
      supabase.from('prokicks_tournaments').select('id,title').order('starts_at', { ascending: true }),
    ]);
    if (error) {
      captureError(error, { area: 'admin-videos-select' });
      setMsg(error.message);
    }
    setItems((data || []) as VideoItem[]);
    setTournaments((tournamentResult.data || []) as Tournament[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function update<K extends keyof VideoItem>(key: K, value: VideoItem[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'youtube_url') {
        next.youtube_video_id = youtubeVideoId(String(value));
        next.embed_url = youtubeEmbedUrl(String(value));
        next.thumbnail_url = youtubeThumbnailUrl(String(value));
      }
      return next;
    });
  }

  async function save() {
    if (!form.title.trim() || !form.embed_url) {
      setMsg('Faltan título y URL válida de YouTube.');
      return;
    }
    setMsg('Guardando...');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      youtube_url: form.youtube_url.trim(),
      youtube_video_id: form.youtube_video_id,
      embed_url: form.embed_url,
      thumbnail_url: form.thumbnail_url || null,
      tournament_id: form.tournament_id || null,
      category: form.category || 'highlight',
      published: form.published,
      sort_order: Number(form.sort_order || 0),
      updated_at: new Date().toISOString(),
    };
    const result = editing
      ? await supabase.from('prokicks_videos').update(payload).eq('id', form.id)
      : await supabase.from('prokicks_videos').insert(payload);
    if (result.error) {
      captureError(result.error, { area: 'admin-videos-save', editing });
      setMsg(result.error.message);
      return;
    }
    setMsg(editing ? 'Video actualizado.' : 'Video guardado.');
    setForm(empty);
    load();
  }

  async function remove(id?: string) {
    if (!id || !window.confirm('¿Eliminar este video?')) return;
    const { error } = await supabase.from('prokicks_videos').delete().eq('id', id);
    if (error) {
      setMsg(error.message);
      return;
    }
    setMsg('Video eliminado.');
    setForm(empty);
    load();
  }

  return (
    <AppShell active="perfil">
      <section className="hero section"><div className="kicker">Admin · Videos</div><h1 className="h1">Videos YouTube</h1><p className="p">Pega links públicos de YouTube. Sin API.</p></section>
      <section className="grid-2 section">
        <div className="card form">
          <div className="row"><h2 className="card-title">{editing ? 'Editar video' : 'Nuevo video'}</h2><button className="btn btn-soft" onClick={() => setForm(empty)}>Nuevo</button></div>
          <input className="input" placeholder="URL de YouTube" value={form.youtube_url} onChange={(event) => update('youtube_url', event.target.value)} />
          {form.embed_url && <iframe className="video-preview" src={form.embed_url} title="Preview" allowFullScreen />}
          <input className="input" placeholder="Título" value={form.title} onChange={(event) => update('title', event.target.value)} />
          <textarea className="input textarea" placeholder="Descripción" value={form.description} onChange={(event) => update('description', event.target.value)} />
          <select className="input" value={form.tournament_id} onChange={(event) => update('tournament_id', event.target.value)}>
            <option value="">Sin torneo relacionado</option>
            {tournaments.map((tournament) => <option key={tournament.id} value={tournament.id}>{tournament.title}</option>)}
          </select>
          <select className="input" value={form.category} onChange={(event) => update('category', event.target.value)}>
            {mediaCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <input className="input" type="number" placeholder="Orden" value={form.sort_order} onChange={(event) => update('sort_order', Number(event.target.value))} />
          <label className="check-row"><input type="checkbox" checked={form.published} onChange={(event) => update('published', event.target.checked)} /><span>Publicado</span></label>
          <button className="btn btn-primary btn-full" onClick={save}><Save size={16} /> Guardar</button>
          {editing && <button className="btn btn-soft btn-full" onClick={() => remove(form.id)}><Trash2 size={16} /> Eliminar</button>}
          {msg && <p className="p">{msg}</p>}
        </div>
        <div className="card form">
          <div className="row"><h2 className="card-title">Videos existentes</h2><button className="btn btn-soft" onClick={load}>{loading ? 'Cargando...' : 'Actualizar'}</button></div>
          <div className="list compact-list">
            {sorted.map((item) => <button key={item.id} className="admin-row" onClick={() => setForm({ ...empty, ...item, tournament_id: item.tournament_id || '', description: item.description || '', thumbnail_url: item.thumbnail_url || '' })}><strong>{item.title}</strong><span>{item.category} · {item.published ? 'publicado' : 'oculto'}</span></button>)}
            {!sorted.length && <p className="p">No hay videos todavía.</p>}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
