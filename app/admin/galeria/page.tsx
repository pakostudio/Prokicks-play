'use client';

import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Save, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/monitoring';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, mediaCategories } from '@/lib/media';

type Tournament = { id: string; title: string };
type GalleryItem = {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  cloudinary_public_id: string;
  tournament_id: string;
  category: string;
  published: boolean;
  sort_order: number;
};

const empty: GalleryItem = {
  title: '',
  description: '',
  image_url: '',
  cloudinary_public_id: '',
  tournament_id: '',
  category: 'torneo',
  published: true,
  sort_order: 0,
};

export default function AdminGaleriaPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [form, setForm] = useState<GalleryItem>(empty);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const editing = Boolean(form.id);
  const sorted = useMemo(() => items.slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)), [items]);

  async function load() {
    setLoading(true);
    const [{ data, error }, tournamentResult] = await Promise.all([
      supabase.from('prokicks_gallery_items').select('*').order('created_at', { ascending: false }),
      supabase.from('prokicks_tournaments').select('id,title').order('starts_at', { ascending: true }),
    ]);
    if (error) {
      captureError(error, { area: 'admin-gallery-select' });
      setMsg(error.message);
    }
    setItems((data || []) as GalleryItem[]);
    setTournaments((tournamentResult.data || []) as Tournament[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function update<K extends keyof GalleryItem>(key: K, value: GalleryItem[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function upload(file?: File) {
    if (!file) return;
    setMsg('Subiendo foto...');
    const body = new FormData();
    body.append('file', file);
    body.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body });
    const result = await response.json();
    if (!response.ok) {
      setMsg(result?.error?.message || 'No se pudo subir la foto.');
      return;
    }
    setForm((prev) => ({ ...prev, image_url: result.secure_url, cloudinary_public_id: result.public_id }));
    setMsg('Foto subida. Completa metadata y guarda.');
  }

  async function save() {
    if (!form.title.trim() || !form.image_url.trim()) {
      setMsg('Faltan título e imagen.');
      return;
    }
    setMsg('Guardando...');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim(),
      cloudinary_public_id: form.cloudinary_public_id.trim() || null,
      tournament_id: form.tournament_id || null,
      category: form.category || 'torneo',
      published: form.published,
      sort_order: Number(form.sort_order || 0),
      updated_at: new Date().toISOString(),
    };
    const result = editing
      ? await supabase.from('prokicks_gallery_items').update(payload).eq('id', form.id)
      : await supabase.from('prokicks_gallery_items').insert(payload);
    if (result.error) {
      captureError(result.error, { area: 'admin-gallery-save', editing });
      setMsg(result.error.message);
      return;
    }
    setMsg(editing ? 'Foto actualizada.' : 'Foto guardada.');
    setForm(empty);
    load();
  }

  async function remove(id?: string) {
    if (!id || !window.confirm('¿Eliminar este registro de galería?')) return;
    const { error } = await supabase.from('prokicks_gallery_items').delete().eq('id', id);
    if (error) {
      setMsg(error.message);
      return;
    }
    setMsg('Foto eliminada.');
    setForm(empty);
    load();
  }

  return (
    <AppShell active="perfil">
      <section className="hero section"><div className="kicker">Admin · Galería</div><h1 className="h1">Fotos ProKicks</h1><p className="p">Sube fotos con Cloudinary unsigned y publica solo lo aprobado.</p></section>
      <section className="grid-2 section">
        <div className="card form">
          <div className="row"><h2 className="card-title">{editing ? 'Editar foto' : 'Nueva foto'}</h2><button className="btn btn-soft" onClick={() => setForm(empty)}>Nueva</button></div>
          <label className="btn btn-soft btn-full"><ImagePlus size={16} /> Subir foto<input type="file" accept="image/*" hidden onChange={(event) => upload(event.target.files?.[0])} /></label>
          {form.image_url && <img className="media-preview" src={form.image_url} alt={form.title || 'Foto'} />}
          <input className="input" placeholder="Título" value={form.title} onChange={(event) => update('title', event.target.value)} />
          <textarea className="input textarea" placeholder="Descripción opcional" value={form.description} onChange={(event) => update('description', event.target.value)} />
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
          <div className="row"><h2 className="card-title">Fotos existentes</h2><button className="btn btn-soft" onClick={load}>{loading ? 'Cargando...' : 'Actualizar'}</button></div>
          <div className="list compact-list">
            {sorted.map((item) => <button key={item.id} className="admin-row" onClick={() => setForm({ ...empty, ...item, tournament_id: item.tournament_id || '', description: item.description || '', cloudinary_public_id: item.cloudinary_public_id || '' })}><strong>{item.title}</strong><span>{item.category} · {item.published ? 'publicada' : 'oculta'}</span></button>)}
            {!sorted.length && <p className="p">No hay fotos todavía.</p>}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
