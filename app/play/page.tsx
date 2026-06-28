'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { SupabaseNotice } from '@/components/SupabaseNotice';
import { realSpots } from '@/lib/demo';
import { supabase } from '@/lib/supabase';
import { Instagram, MapPin, QrCode, ShieldCheck, Trophy, UserRound } from 'lucide-react';

type Challenge = {
  id: string;
  title: string;
  spot_name?: string | null;
  spot_code?: string | null;
  type?: string | null;
  status?: string | null;
};

type LocalProfile = {
  nickname?: string;
  avatar_image?: string;
  avatar_name?: string;
};

export default function HomePage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [profile, setProfile] = useState<LocalProfile | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('prokicks_profile');
      if (raw) setProfile(JSON.parse(raw));
    } catch {
      setProfile(null);
    }

    supabase
      .from('prokicks_challenges')
      .select('id,title,spot_name,spot_code,type,status,created_at')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setChallenges((data || []) as Challenge[]));
  }, []);

  return (
    <AppShell active="home">
      <SupabaseNotice />

      <section className="pro-home-hero section">
        <div className="pro-home-media">
          <Image src="/prokicks-approved-hero.jpeg" alt="ProKicks Play" fill priority sizes="(max-width: 600px) 100vw, 560px" />
        </div>
        <div className="pro-home-content">
          <div className="pro-home-topline">
            <span>ProKicks Play</span>
            <Link href="/admin/login" className="pro-admin-chip"><ShieldCheck size={14} /> Admin</Link>
          </div>
          <h1>Juega. Conecta. Compite.</h1>
          <p>Crea tu perfil, conecta spots reales y súmate a retas o torneos ProKicks.</p>
          {profile && <div className="pro-profile-pill">Continuar como <strong>{profile.nickname || 'jugador ProKicks'}</strong></div>}
          <div className="pro-home-actions">
            <Link className="btn btn-primary" href="/registro"><UserRound size={18}/> Crear perfil</Link>
            <Link className="btn btn-soft" href="/">Entrar / continuar</Link>
            <Link className="btn btn-warm" href="/torneos"><Trophy size={18}/> Ver torneos</Link>
            <Link className="btn btn-soft" href="/scan"><QrCode size={18}/> Escanear QR / conectar spot para Reta</Link>
            <Link className="btn btn-primary" href="/spots"><MapPin size={18}/> Encuentra spots para echar la reta</Link>
          </div>
        </div>
      </section>

      <section className="grid-2 section home-stats">
        <div className="stat"><span className="muted">Spots reales</span><strong>{realSpots.length}</strong></div>
        <div className="stat"><span className="muted">Retas abiertas</span><strong>{challenges.length}</strong></div>
      </section>

      <section className="section">
        <div className="row"><h2 className="h2">Retas cerca</h2><Link className="tag tag-blue" href="/retas">Ver todas</Link></div>
        <div className="list">
          {challenges.map((c) => (
            <article className="card challenge-card" key={c.id}>
              <div className="row"><h3 className="card-title">{c.title}</h3><span className="tag tag-warm">{c.status || 'Abierta'}</span></div>
              <p className="p">{c.spot_name} · formato {c.type || 'abierto'}</p>
              <div className="grid-2">
                <Link href={`/retas/${c.id}`} className="btn btn-soft">Ver reta</Link>
                <Link href={`/retas/${c.id}`} className="btn btn-primary">Unirme</Link>
              </div>
            </article>
          ))}
          {!challenges.length && <section className="card empty-state-card"><h3 className="card-title">Aún no hay retas abiertas</h3><p className="p">Escanea un spot y crea la primera reta.</p><Link className="btn btn-primary btn-full section" href="/scan">Conectar spot</Link></section>}
        </div>
      </section>

      <section className="section">
        <div className="row"><h2 className="h2">Explora ProKicks</h2></div>
        <div className="grid-2">
          <Link className="btn btn-soft" href="/comunidad">Comunidad</Link>
          <Link className="btn btn-soft" href="/tutoriales">Videos</Link>
          <Link className="btn btn-soft" href="/galeria">Galería</Link>
          <Link className="btn btn-soft" href="/contacto">Contáctanos</Link>
          <Link className="btn btn-soft" href="/faq">FAQ</Link>
          <Link className="btn btn-soft" href="/comprar">Comprar</Link>
          <Link className="btn btn-soft" href="/legal">Legal</Link>
          <Link className="btn btn-soft" href="/perfil">Perfil</Link>
          <a className="btn btn-warm btn-full instagram-wide" href="https://www.instagram.com/prokicksoficial?igsh=MTQyZDgwcTUwcTdxOQ==" target="_blank" rel="noreferrer"><Instagram size={18}/> Seguir en Instagram</a>
        </div>
      </section>
    </AppShell>
  );
}
