'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { avatarOptions } from '@/lib/demo';

type Profile = {
  name: string;
  email: string;
  whatsapp: string;
  nickname: string;
  avatar_id: string;
  avatar_name: string;
};

export default function PerfilPage(){
  const [profile,setProfile]=useState<Profile | null>(null);
  const avatar = avatarOptions.find((item) => item.id === profile?.avatar_id) || avatarOptions[0];

  useEffect(() => {
    const raw = window.localStorage.getItem('prokicks_profile');
    if (raw) setProfile(JSON.parse(raw));
  }, []);

  return <AppShell active="perfil">
    <section className="hero section"><div className="kicker">Jugador</div><h1 className="h1">Perfil ProKicks</h1><p className="p">Tu identidad para retas, spots y torneos.</p></section>
    {!profile && <section className="card section"><h2 className="card-title">Aún no tienes perfil</h2><p className="p">Crea tu nickname y avatar para continuar con el flujo real.</p><Link href="/registro" className="btn btn-primary btn-full">Crear perfil</Link></section>}
    {profile && <section className="card section">
      <div className={`avatar-preview ${avatar.tone}`}>{avatar.initials}</div>
      <h2 className="card-title">{profile.nickname}</h2>
      <p className="p">{profile.name} · {profile.avatar_name}</p>
      <p className="p">{profile.email}<br/>{profile.whatsapp}</p>
    </section>}
    <section className="grid-2 section">
      <div className="stat"><span className="muted">XP</span><strong style={{fontSize:18}}>En preparación</strong></div>
      <div className="stat"><span className="muted">Badges</span><strong style={{fontSize:18}}>Próximamente</strong></div>
      <div className="stat"><span className="muted">Retas</span><strong style={{fontSize:18}}>Activas</strong></div>
      <div className="stat"><span className="muted">Ranking</span><strong style={{fontSize:18}}>Próximamente</strong></div>
    </section>
    <section className="grid section"><Link href="/registro" className="btn btn-soft">Editar / recrear perfil</Link><Link href="/scan" className="btn btn-primary">Conectar spot</Link></section>
  </AppShell>
}
