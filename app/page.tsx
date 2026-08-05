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
      <svg className="preloader-ball" width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="44" fill="#ffffff" stroke="#173B63" strokeWidth="4" />
        <polygon points="50,36 63.31,45.67 58.23,61.32 41.77,61.32 36.69,45.67" fill="#173B63" />
        <line x1="50" y1="36" x2="50" y2="6" stroke="#173B63" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="63.31" y1="45.67" x2="91.84" y2="36.4" stroke="#173B63" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="58.23" y1="61.32" x2="75.87" y2="85.6" stroke="#173B63" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="41.77" y1="61.32" x2="24.13" y2="85.6" stroke="#173B63" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="36.69" y1="45.67" x2="8.16" y2="36.4" stroke="#173B63" strokeWidth="3.5" strokeLinecap="round" />
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

