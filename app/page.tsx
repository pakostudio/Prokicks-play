'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShieldCheck, UserRound, Users } from 'lucide-react';

type LocalProfile = {
  nickname?: string;
  avatar_image?: string;
  avatar_name?: string;
};

function SoccerBallLoader() {
  return (
    <div className="preloader">
      <svg className="preloader-ball" width="56" height="56" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#173B63" strokeWidth="4" />
        <g fill="#173B63">
          <polygon points="50,28 61,36 57,49 43,49 39,36" />
          <polygon points="50,28 39,36 30,28 34,16 46,14" />
          <polygon points="50,28 61,36 70,28 66,16 54,14" />
          <polygon points="39,36 30,28 20,38 24,52 34,55" />
          <polygon points="61,36 70,28 80,38 76,52 66,55" />
          <polygon points="43,49 34,55 38,68 50,72 46,60" />
          <polygon points="57,49 66,55 62,68 50,72 54,60" />
        </g>
      </svg>
      <p className="preloader-text">Cargando ProKicks…</p>
    </div>
  );
}

export default function EntryPage() {
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = window.localStorage.getItem('prokicks_profile');
    if (raw) setProfile(JSON.parse(raw));
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  function clearProfile() {
    window.localStorage.removeItem('prokicks_profile');
    window.localStorage.removeItem('prokicks_last_challenge');
    setProfile(null);
  }

  if (loading) return <SoccerBallLoader />;

  return (
    <main className="entry-screen">
      <section className="entry-hero">
        <Image src="/logo-negro.png" alt="ProKicks" width={180} height={58} className="entry-logo" priority />
        <div className="kicker">ProKicks Play</div>
        <h1 className="h1">Entrena. Compite. Domina.</h1>
        <p className="p">Crea tu perfil, conecta spots reales y vive la experiencia ProKicks.</p>
        <Image
          src="/prokicks-approved-hero.jpeg"
          alt="ProKicks Play"
          width={900}
          height={580}
          className="entry-hero-image"
          priority
        />
      </section>

      {profile && (
        <section className="card entry-profile">
          {profile.avatar_image && <img className="admin-avatar-img" src={profile.avatar_image} alt={profile.avatar_name || 'Avatar'} />}
          <div>
            <span className="muted">Perfil guardado</span>
            <h2 className="card-title">Continuar como {profile.nickname || 'jugador ProKicks'}</h2>
          </div>
        </section>
      )}

      <section className="grid section entry-actions">
        {profile ? (
          <Link className="btn btn-primary btn-full" href="/play"><UserRound size={18} /> Continuar como {profile.nickname || 'jugador ProKicks'}</Link>
        ) : (
          <Link className="btn btn-primary btn-full" href="/registro"><UserRound size={18} /> Crear perfil</Link>
        )}
        <Link className="btn btn-outline btn-full" href={profile ? '/registro' : '/login'}>{profile ? 'Crear otro perfil' : 'Ya tengo cuenta'}</Link>

        <div className="entry-divider"><span /> o <span /></div>

        <Link className="link-muted" href="/play?mode=guest"><Users size={16} /> Entrar como invitado</Link>
        {profile && <button className="link-muted" onClick={clearProfile}>Cambiar usuario / borrar perfil local</button>}
      </section>

      <Link className="admin-link" href="/admin/login"><ShieldCheck size={14} /> Acceso admin</Link>
    </main>
  );
}
