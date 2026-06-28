import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { SupabaseNotice } from '@/components/SupabaseNotice';
import { demoChallenges, demoSpots } from '@/lib/demo';
import { MapPin, QrCode, Trophy, UserRound } from 'lucide-react';

export default function HomePage() {
  return (
    <AppShell active="home">
      <SupabaseNotice />
      <section className="hero home-hero section">
        <div className="home-mark">PK</div>
        <div className="kicker">ProKicks Play</div>
        <h1 className="h1">Juega. Conecta. Compite.</h1>
        <p className="p">Crea tu perfil, encuentra spots para echar la reta, conecta un spot y regístrate al torneo Indoor Community.</p>
        <div className="grid-2 section">
          <Link className="btn btn-primary" href="/registro"><UserRound size={18}/> Registrarme</Link>
          <Link className="btn btn-soft" href="/login">Entrar / continuar</Link>
          <Link className="btn btn-warm" href="/torneos"><Trophy size={18}/> Ver torneos</Link>
          <Link className="btn btn-soft" href="/scan"><QrCode size={18}/> Escanear QR / conectar spot para Reta</Link>
          <Link className="btn btn-primary" href="/spots"><MapPin size={18}/> Encuentra spots para echar la reta</Link>
        </div>
      </section>

      <section className="grid-2 section home-stats">
        <div className="stat"><span className="muted">Spots reales</span><strong>{demoSpots.length}</strong></div>
        <div className="stat"><span className="muted">Retas abiertas</span><strong>{demoChallenges.length}</strong></div>
      </section>

      <section className="section">
        <div className="row"><h2 className="h2">Retas cerca</h2><Link className="tag tag-blue" href="/retas">Ver todas</Link></div>
        <div className="list">
          {demoChallenges.map((c) => (
            <article className="card challenge-card" key={c.id}>
              <div className="row"><h3 className="card-title">{c.title}</h3><span className="tag tag-warm">{c.status}</span></div>
              <p className="p">{c.spot_name} · formato {c.type}</p>
              <div className="grid-2">
                <Link href={`/retas/${c.id}`} className="btn btn-soft">Ver reta</Link>
                <Link href={`/retas/${c.id}`} className="btn btn-primary">Unirme</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card section">
        <div className="row"><Trophy color="#504080"/><div><h3 className="card-title">Ranking ProKicks en preparación</h3><p className="p">Pronto podrás ver puntos, posiciones y evolución por jugador.</p></div></div>
      </section>

      <section className="section">
        <div className="row"><h2 className="h2">Explora ProKicks</h2></div>
        <div className="grid-2">
          <Link className="btn btn-soft" href="/comunidad">Comunidad</Link>
          <Link className="btn btn-soft" href="/tutoriales">Videos / demos</Link>
          <Link className="btn btn-soft" href="/galeria">Galería</Link>
          <Link className="btn btn-soft" href="/contacto">Contáctanos</Link>
          <Link className="btn btn-soft" href="/faq">FAQ</Link>
          <Link className="btn btn-soft" href="/comprar">Comprar</Link>
          <Link className="btn btn-soft" href="/legal">Legal</Link>
          <Link className="btn btn-soft" href="/perfil">Perfil</Link>
        </div>
      </section>
    </AppShell>
  );
}
