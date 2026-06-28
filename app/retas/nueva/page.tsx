'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { realSpots } from '@/lib/demo';
import { supabase } from '@/lib/supabase';

type LocalProfile = {
  name: string;
  nickname: string;
  avatar_id: string;
  avatar_name: string;
  avatar_image?: string;
};

export default function NewChallenge(){
  const [title,setTitle]=useState('Reta Indoor Community');
  const [spotId,setSpotId]=useState(realSpots[0].id);
  const [type,setType]=useState('1v1');
  const [scheduledAt,setScheduledAt]=useState('');
  const [profile,setProfile]=useState<LocalProfile | null>(null);
  const [msg,setMsg]=useState('');
  const [loading,setLoading]=useState(false);
  const spot = useMemo(() => realSpots.find((item) => item.id === spotId) || realSpots[0], [spotId]);

  useEffect(() => {
    const raw = window.localStorage.getItem('prokicks_profile');
    if (raw) setProfile(JSON.parse(raw));
    const spotParam = new URLSearchParams(window.location.search).get('spot');
    if (spotParam && realSpots.some((item) => item.id === spotParam)) setSpotId(spotParam);
  }, []);

  async function create(){
    setMsg('');
    if (!profile) {
      setMsg('Crea tu perfil ProKicks antes de crear una reta.');
      return;
    }

    setLoading(true);
    const payload = {
      title,
      spot_id: spot.id,
      spot_code: spot.code,
      spot_name: spot.name,
      creator_name: profile.name,
      creator_nickname: profile.nickname,
      creator_avatar_id: profile.avatar_id,
      creator_avatar_image: profile.avatar_image || null,
      type,
      status: 'abierta',
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
    };

    let { data, error } = await supabase.from('prokicks_challenges').insert(payload).select().maybeSingle();
    if (error && String(error.message || '').includes('creator_avatar_image')) {
      const { creator_avatar_image, ...payloadWithoutImage } = payload;
      const retry = await supabase.from('prokicks_challenges').insert(payloadWithoutImage).select().maybeSingle();
      data = retry.data;
      error = retry.error;
    }
    setLoading(false);

    if (error) {
      setMsg('No pudimos guardar la reta en este momento. Revisa conexión o policies de Supabase.');
      return;
    }
    setMsg('Reta creada. Ya aparece como abierta.');
  }

  return <AppShell active="retas">
    <section className="hero section"><div className="kicker">Nueva reta</div><h1 className="h1">Crear reta en este spot</h1><p className="p">Asocia tu nickname y avatar al spot elegido.</p></section>
    <section className="card form section">
      {!profile && <div className="alert warn">Primero crea tu perfil básico para que la reta salga con nickname y avatar. <Link href="/registro">Crear perfil</Link></div>}
      {profile && <div className="alert ok">Perfil activo: {profile.nickname} · {profile.avatar_name}</div>}
      <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nombre de la reta" />
      <select className="input" value={spotId} onChange={e=>setSpotId(e.target.value)}>{realSpots.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <p className="p">{spot.address}</p>
      <select className="input" value={type} onChange={e=>setType(e.target.value)}><option>1v1</option><option>2v2</option><option>3v3</option><option>5v5</option></select>
      <label className="field-label">Fecha/hora opcional</label>
      <input className="input" type="datetime-local" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)} />
      {msg && <div className={msg.includes('creada') ? 'alert ok' : 'alert warn'}>{msg}</div>}
      <button className="btn btn-primary" onClick={create} disabled={loading}>{loading ? 'Creando...' : 'Crear reta'}</button>
      {msg && <Link className="btn btn-soft btn-full" href="/admin/retas">Ver en admin</Link>}
    </section>
  </AppShell>
}
