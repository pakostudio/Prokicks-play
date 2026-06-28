'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { SupabaseNotice } from '@/components/SupabaseNotice';
import { realSpots } from '@/lib/demo';
import { supabase } from '@/lib/supabase';
import { FileText, MapPin, QrCode, Star, Trophy, UserRound } from 'lucide-react';

type Challenge = {
  id: string;
  title: string;
  spot_name?: string | null;
  spot_code?: string | null;
  type?: string | null;
  status?: string | null;
};

export default function HomePage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
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

      <section className="hero section pro-home-clean">
        <div className="kicker">ProKicks Play</div>
        <h1 className="h1">Entrena. Compite. Domina.</h1>
        <p className="p">Crea tu perfil, conecta spots reales y vive la experiencia ProKicks.</p>

        <div className="hero-image-card">
          <Image src="/prokicks-approved-hero.jpeg" alt="ProKicks Play" width={720} height={420} priority />
        </div>

        <div className="grid-2 section">
          <Link className="btn btn-primary" href="/registro"><UserRound size={18}/> Crear perfil</Link>
          <Link className="btn btn-secondary-blue" href="/">Entrar / continuar</Link>
          <Link className="btn btn-secondary-blue" href="/torneos"><Trophy size={18}/> Ver torneos</Link>
          <Link className="btn btn-soft" href="/scan"><QrCode size={18}/> Escanear QR / conectar spot para Reta</Link>
          <Link className="btn btn-primary btn-full" href="/spots"><MapPin size={18}/> Encuentra spots para echar la reta</Link>
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
          {!challenges.length && (
            <section className="card">
              <h3 className="card-title">Aún no hay retas abiertas</h3>
              <p className="p">Escanea un spot y crea la primera reta.</p>
              <Link className="btn btn-primary btn-full section" href="/scan">Conectar spot</Link>
            </section>
          )}
        </div>
      </section>

      <section className="section">
        <div className="row"><h2 className="h2">Torneo inaugural</h2></div>
        <div className="card">
          <h3 className="card-title">ProKicks x Indoor Community</h3>
          <p className="p">Consulta el flyer oficial, cronograma y sede del torneo.</p>
          <div className="grid-2 section">
            <Link className="btn btn-secondary-blue" href="/torneos"><Trophy size={18}/> Ver torneo</Link>
            <a className="btn btn-soft" href="/docs/torneo-inaugural-prokicks-2026.pdf" target="_blank" rel="noopener noreferrer"><FileText size={18}/> Ver PDF</a>
          </div>
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
          <a className="btn btn-secondary-blue btn-full" href="https://www.instagram.com/prokicksoficial?igsh=MTQyZDgwcTUwcTdxOQ==" target="_blank" rel="noopener noreferrer"><Star size={18}/> Seguir en Instagram</a>
        </div>
      </section>
    </AppShell>
  );
}
