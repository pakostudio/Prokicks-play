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

export default function EntryPage() {
  const [profile, setProfile] = useState<LocalProfile | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem('prokicks_profile');
    if (raw) setProfile(JSON.parse(raw));
  }, []);

  function clearProfile() {
    window.localStorage.removeItem('prokicks_profile');
    window.localStorage.removeItem('prokicks_last_challenge');
    setProfile(null);
  }

  return (
    <main className="entry-screen">
      <section className="entry-hero entry-hero-approved">
        <div className="entry-logo-clean">
          <Image src="/logo-negro.png" alt="ProKicks" width={240} height={86} className="logo entry-main-logo" priority />
        </div>
        <div className="entry-logo-line"></div>
        <div className="kicker">ProKicks Play</div>
        <h1 className="h1">Entrena. Compite. Domina.</h1>
        <p className="p">Crea tu perfil, conecta spots reales y vive la experiencia ProKicks.</p>
        <div className="entry-approved-image">
          <Image src="/prokicks-approved-hero.jpeg" alt="ProKicks Play" width={720} height={420} priority />
        </div>
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

      <section className="grid section">
        <Link className="btn btn-primary btn-full" href="/registro"><UserRound size={18} /> Crear perfil</Link>
        <Link className="btn btn-secondary-blue btn-full" href={profile ? '/play' : '/registro'}>Entrar como usuario registrado</Link>
        {profile && <Link className="btn btn-soft btn-full" href="/play">Continuar como {profile.nickname || 'jugador ProKicks'}</Link>}
        <Link className="btn btn-soft btn-full" href="/play?mode=guest"><Users size={18} /> Entrar como invitado</Link>
        <Link className="btn btn-soft btn-full" href="/admin/login"><ShieldCheck size={18} /> Admin</Link>
        {profile && <button className="btn btn-soft btn-full" onClick={clearProfile}>Cambiar usuario / borrar perfil local</button>}
      </section>
    </main>
  );
}
