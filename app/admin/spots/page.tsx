'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MapPin, Plus, Save } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/monitoring';

type Spot = {
  id?: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  maps_url: string;
  active: boolean;
  created_at?: string | null;
};

const emptySpot: Spot = {
  name: '',
  code: '',
  address: '',
  city: 'CDMX',
  state: 'Ciudad de México',
  maps_url: '',
  active: true,
};

export default function AdminSpots() {
  const [items, setItems] = useState<Spot[]>([]);
  const [form, setForm] = useState<Spot>(emptySpot);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const editing = Boolean(form.id);
  const sorted = useMemo(() => items.slice().sort((a, b) => a.name.localeCompare(b.name)), [items]);

  async function load() {
    setLoading(true);
    setMsg('');
    const { data, error } = await supabase
      .from('prokicks_spots')
      .select('id,name,code,address,city,state,maps_url,active,created_at')
      .order('name', { ascending: true });

    if (error) {
      captureError(error, { area: 'admin-spots-select' });
      setMsg(error.message);
    }

    setItems((data || []) as Spot[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function update<K extends keyof Spot>(key: K, value: Spot[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function newSpot() {
    setForm(emptySpot);
    setMsg('');
  }

  async function save() {
    if (!form.name.trim() || !form.code.trim()) {
      setMsg('Faltan nombre y código QR del spot.');
      return;
    }

    setMsg('Guardando...');
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      address: form.address.trim(),
      city: form.city.trim() || 'CDMX',
      state: form.state.trim() || 'Ciudad de México',
      maps_url: form.maps_url.trim(),
      active: form.active,
    };

    const result = editing
      ? await supabase.from('prokicks_spots').update(payload).eq('id', form.id)
      : await supabase.from('prokicks_spots').insert(payload);

    if (result.error) {
      captureError(result.error, { area: 'admin-spots-save', editing });
      setMsg(result.error.message);
      return;
    }

    setMsg(editing ? 'Spot actualizado.' : 'Spot creado.');
    setForm(emptySpot);
    load();
  }

  return (
    <AppShell active="perfil">
      <section className="hero section">
        <div className="kicker">Admin · Spots</div>
        <h1 className="h1">Spots / QR</h1>
        <p className="p">Administra sedes, códigos QR y visibilidad pública.</p>
      </section>

      <section className="grid-2 section">
        <div className="card form">
          <div className="row">
            <h2 className="card-title">{editing ? 'Editar spot' : 'Nuevo spot'}</h2>
            <button className="btn btn-soft" onClick={newSpot}><Plus size={16} /> Nuevo spot</button>
          </div>

          <input className="input" placeholder="Nombre del spot" value={form.name} onChange={(event) => update('name', event.target.value)} />
          <input className="input" placeholder="Código QR / identificador" value={form.code} onChange={(event) => update('code', event.target.value)} />
          <textarea className="input textarea" placeholder="Dirección completa" value={form.address} onChange={(event) => update('address', event.target.value)} />
          <div className="grid-2 tight">
            <input className="input" placeholder="Ciudad" value={form.city} onChange={(event) => update('city', event.target.value)} />
            <input className="input" placeholder="Estado" value={form.state} onChange={(event) => update('state', event.target.value)} />
          </div>
          <input className="input" placeholder="Google Maps URL" value={form.maps_url} onChange={(event) => update('maps_url', event.target.value)} />
          <label className="check-row">
            <input type="checkbox" checked={form.active} onChange={(event) => update('active', event.target.checked)} />
            <span>Spot activo</span>
          </label>
          <button className="btn btn-primary btn-full" onClick={save}><Save size={16} /> Guardar</button>
          {msg && <div className={msg.includes('Error') || msg.includes('Faltan') ? 'alert error' : 'alert ok'}>{msg}</div>}
        </div>

        <div className="card form">
          <div className="row">
            <h2 className="card-title">Spots existentes</h2>
            <button className="btn btn-soft" onClick={load}>{loading ? 'Cargando...' : 'Actualizar'}</button>
          </div>
          <div className="list compact-list">
            {sorted.map((spot) => (
              <button
                key={spot.id || spot.code}
                className="admin-row"
                onClick={() => setForm({ ...emptySpot, ...spot, active: spot.active !== false })}
              >
                <strong>{spot.name}</strong>
                <span><MapPin size={13} />{spot.code} · {spot.active === false ? 'Inactivo' : 'Activo'}</span>
                <small>{spot.address || `${spot.city} · ${spot.state}`}</small>
              </button>
            ))}
            {!sorted.length && <p className="p">No hay spots todavía.</p>}
          </div>
          <Link className="btn btn-soft btn-full" href="/spots">Ver spots públicos</Link>
        </div>
      </section>
    </AppShell>
  );
}
