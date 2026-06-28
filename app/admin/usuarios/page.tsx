'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/AdminShell';
import { supabase } from '@/lib/supabase';
import { avatarOptions } from '@/lib/demo';

type Profile = {
  id?: string;
  name?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  nickname?: string | null;
  avatar_id?: string | null;
  avatar_name?: string | null;
  avatar_image?: string | null;
  created_at?: string | null;
};

export default function AdminUsuarios(){
  const [rows,setRows]=useState<Profile[]>([]);
  const [msg,setMsg]=useState('');

  async function load(){
    const { data, error } = await supabase.from('prokicks_profiles').select('id,name,email,whatsapp,nickname,avatar_id,avatar_name,created_at').order('created_at', { ascending:false }).limit(50);
    const localRaw = window.localStorage.getItem('prokicks_profile');
    const local = localRaw ? JSON.parse(localRaw) : null;
    if (error) setMsg('Perfiles en Supabase pendientes de SQL/policies. Mostrando perfil local de presentación si existe.');
    setRows([...(local ? [local] : []), ...((data || []) as Profile[])]);
  }

  useEffect(()=>{ load(); },[]);

  return <AdminShell active="usuarios">
    <section className="hero section"><div className="kicker">Admin</div><h1 className="h1">Usuarios / perfiles</h1><p className="p">Nombre, email, WhatsApp, nickname, avatar y fecha de registro.</p></section>
    <section className="card form section">
      <div className="row"><strong>{rows.length} perfiles</strong><button className="btn btn-soft" onClick={load}>Actualizar</button></div>
      {msg && <div className="alert warn">{msg}</div>}
      <div className="table-wrap"><table className="admin-table"><thead><tr><th>Nombre</th><th>Contacto</th><th>Nickname</th><th>Avatar</th><th>Fecha</th></tr></thead><tbody>
        {rows.map((row, index)=>{
          const avatar = avatarOptions.find((item) => item.id === row.avatar_id);
          const image = row.avatar_image || avatar?.image;
          return <tr key={row.id || `${row.email}-${index}`}><td>{row.name || '-'}</td><td>{row.email || '-'}<br/><small>{row.whatsapp || ''}</small></td><td>{row.nickname || '-'}</td><td>{image && <img className="admin-avatar-img" src={image} alt={row.avatar_name || row.avatar_id || 'Avatar'} />}{row.avatar_name || row.avatar_id || '-'}</td><td>{row.created_at ? new Date(row.created_at).toLocaleString('es-MX') : '-'}</td></tr>
        })}
      </tbody></table></div>
      {!rows.length && <p className="p">Aún no hay perfiles.</p>}
    </section>
    <section className="section"><Link className="btn btn-soft btn-full" href="/admin">Volver a Admin</Link></section>
  </AdminShell>
}
