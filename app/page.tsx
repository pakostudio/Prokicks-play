'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, UserRound, Users, CalendarDays } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDateShortEs } from '@/lib/format';

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
      <img className="preloader-ball" src="/ball-loader.svg" alt="Cargando" width={90} height={90} />
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
        <Link href={`/torneos/${nextTournament.id}/registro`} className="entry-stat-card">
          <CalendarDays size={16} />
          <div>
            <strong>{formatDateShortEs(nextTournament.starts_at as string)}</strong>
            <span>Próximo torneo: {nextTournament.title}</span>
            <span className="entry-stat-cta"><ArrowRight size={12} /> Inscríbete aquí</span>
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
