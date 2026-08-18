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

function getTimeLeft(target: string) {
  const total = new Date(target).getTime() - Date.now();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { total, days, hours, minutes, seconds };
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function TournamentCountdown({ target }: { target: string }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (timeLeft.total <= 0) {
    return <span className="next-tournament-live">¡El torneo ya comenzó!</span>;
  }

  return (
    <div className="next-tournament-countdown">
      <div className="countdown-unit">
        <strong>{timeLeft.days}</strong>
        <span>días</span>
      </div>
      <div className="countdown-unit">
        <strong>{pad(timeLeft.hours)}</strong>
        <span>hrs</span>
      </div>
      <div className="countdown-unit">
        <strong>{pad(timeLeft.minutes)}</strong>
        <span>min</span>
      </div>
      <div className="countdown-unit">
        <strong>{pad(timeLeft.seconds)}</strong>
        <span>seg</span>
      </div>
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
          <div className="welcome-badge">Bienvenido a la comunidad ProKicks Play</div>
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
        <Link href={`/torneos/${nextTournament.id}/registro`} className="next-tournament-card">
          <div className="next-tournament-top">
            <span className="next-tournament-badge"><CalendarDays size={14} /> Próximo torneo</span>
            <span className="next-tournament-date">{formatDateShortEs(nextTournament.starts_at as string)}</span>
          </div>
          <h3 className="next-tournament-title">{nextTournament.title}</h3>
          {nextTournament.starts_at && <TournamentCountdown target={nextTournament.starts_at} />}
          <span className="next-tournament-cta"><ArrowRight size={14} /> Inscríbete aquí</span>
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
