'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShieldCheck, UserRound, Users, CalendarDays } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type LocalProfile = {
  nickname?: string;
  avatar_image?: string;
  avatar_name?: string;
};

type NextTournament = {
  id: string;
  title: string;
  starts_at: string | null;
};

function SoccerBallLoader() {
  return (
    <div className="preloader">
      <svg className="preloader-ball" width="90" height="90" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#173B63" strokeWidth="3" />
          <polygon points="50,37 62.36,45.98 57.64,60.52 42.36,60.52 37.64,45.98" fill="#173B63" />
          <polygon points="50,12 57.6,17.53 54.7,26.47 45.3,26.47 42.4,17.53" fill="#173B63" />
          <polygon points="78.5,32.7 86.1,38.23 83.2,47.17 73.8,47.17 70.9,38.23" fill="#173B63" />
          <polygon points="67.6,66.3 75.2,71.83 72.3,80.77 62.9,80.77 60.0,71.83" fill="#173B63" />
          <polygon points="32.4,66.3 40.0,71.83 37.1,80.77 27.7,80.77 24.8,71.83" fill="#173B63" />
          <polygon points="21.5,32.7 29.1,38.23 26.2,47.17 16.8,47.17 13.9,38.23" fill="#173B63" />
        </svg>
      <p className="preloader-text">Cargando ProKicks…</p>
    </div>
  );
}

export default function EntryPage() {
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextTournament, setNextTournament] = useState<NextTournament | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem('prokicks_profile');
    if (raw) setProfile(JSON.parse(raw));
    const timer = setTimeout(() => setLoading(false), 900);

    supabase
      .from('prokicks_tournaments')
      .select('id, title, starts_at')
      .eq('status', 'open')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length) setNextTournament(data[0] as NextTournament);
      });

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
      <section className="entry-hero-full">
        <div className="entry-hero-media">
          <Image
            src="/prokicks-approved-hero.jpeg"
            alt="ProKicks Play"
            width={900}
            height={580}
            className="entry-hero-image-full"
            priority
          />
          <div className="entry-logo-badge">
            <Image src="/logo-negro.png" alt="ProKicks" width={34} height={34} priority />
          </div>
        </div>
        <div className="entry-hero-copy">
          <div className="kicker">ProKicks Play</div>
          <h1 className="h1">Entrena. Compite. Domina.</h1>
          <p className="p">Crea tu perfil, conecta spots reales y vive la experiencia ProKicks.</p>
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

      {nextTournament && (
        <Link href="/torneos" className="entry-stat-card">
          <CalendarDays size={16} />
          <div>
            <strong>{new Date(nextTournament.starts_at as string).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</strong>
            <span>Próximo torneo: {nextTournament.title}</span>
          </div>
        </Link>
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

