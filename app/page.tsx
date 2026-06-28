'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShieldCheck, UserRound, Users, PlayCircle, Trash2 } from 'lucide-react';

type LocalProfile = {
  nickname?: string;
  avatar_image?: string;
  avatar_name?: string;
};

export default function EntryPage() {
  const [profile, setProfile] = useState<LocalProfile | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('prokicks_profile');
      if (raw) setProfile(JSON.parse(raw));
    } catch {
      setProfile(null);
    }
  }, []);

  function clearProfile() {
    window.localStorage.removeItem('prokicks_profile');
    window.localStorage.removeItem('prokicks_last_challenge');
    setProfile(null);
  }

  return (
    <main className="entry-screen pro-entry-screen">
      <section className="pro-entry-hero">
        <div className="pro-entry-hero-image">
          <Image src="/prokicks-approved-hero.jpeg" alt="ProKicks Play" fill priority sizes="(max-width: 600px) 100vw, 560px" />
        </div>
        <div className="pro-entry-overlay">
          <Image src="/logo-negro.png" alt="ProKicks" width={118} height={118} className="pro-entry-logo" priority />
          <span className="pro-entry-kicker">ProKicks Play</span>
          <h1>Juega. Conecta. Compite.</h1>
          <p>Elige cómo quieres entrar: crea tu perfil, continúa como jugador, explora como invitado o entra al admin.</p>
        </div>
      </section>

      {profile && (
        <section className="card pro-entry-profile">
          {profile.avatar_image ? (
            <img className="admin-avatar-img" src={profile.avatar_image} alt={profile.avatar_name || 'Avatar'} />
          ) : (
            <div className="avatar">PK</div>
          )}
          <div>
            <span className="muted">Perfil guardado</span>
            <h2 className="card-title">Continuar como {profile.nickname || 'jugador ProKicks'}</h2>
          </div>
        </section>
      )}

      <section className="pro-entry-actions section">
        <Link className="btn btn-primary btn-full" href="/registro"><UserRound size={18} /> Crear perfil</Link>
        <Link className="btn btn-warm btn-full" href={profile ? '/play' : '/registro'}><PlayCircle size={18} /> Entrar como usuario registrado</Link>
        <Link className="btn btn-soft btn-full" href="/play?mode=guest"><Users size={18} /> Entrar como invitado</Link>
        <Link className="btn btn-soft btn-full admin-access-btn" href="/admin/login"><ShieldCheck size={18} /> Admin</Link>
        {profile && <button className="btn btn-soft btn-full" onClick={clearProfile}><Trash2 size={18} /> Cambiar usuario / borrar perfil local</button>}
      </section>
    </main>
  );
}
