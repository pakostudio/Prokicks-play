import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { SupabaseNotice } from '@/components/SupabaseNotice';
import { demoChallenges, demoSpots } from '@/lib/demo';
import { QrCode, Swords, Trophy } from 'lucide-react';

export default function HomePage() {
  return (
    <AppShell active="home">
      <SupabaseNotice />
      <section className="hero section">
        <div className="kicker">ProKicks Play · MVP</div>
        <h1 className="h1">Juega. Conecta. Compite.</h1>
        <p className="p">Encuentra spots, escanea el QR, crea retas y sube en el ranking.</p>
        <div className="grid-2 section">
          <Link className="btn btn-primary" href="/scan"><QrCode size={18}/> Escanear QR</Link>
          <Link className="btn btn-warm" href="/retas/nueva"><Swords size={18}/> Crear reta</Link>
        </div>
      </section>

      <section className="grid-2 section">
        <div className="stat"><span className="muted">Spots activos</span><strong>{demoSpots.length}</strong></div>
        <div className="stat"><span className="muted">Retas abiertas</span><strong>{demoChallenges.length}</strong></div>
      </section>

      <section className="section">
        <div className="row"><h2 className="h2">Retas cerca</h2><Link className="tag tag-blue" href="/retas">Ver todas</Link></div>
        <div className="list">
          {demoChallenges.map((c) => (
            <Link href={`/retas/${c.id}`} className="card" key={c.id}>
              <div className="row"><h3 className="card-title">{c.title}</h3><span className="tag tag-warm">{c.type}</span></div>
              <p className="p">{c.spot_name} · {c.level}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="card section">
        <div className="row"><Trophy color="#504080"/><div><h3 className="card-title">Ranking activo</h3><p className="p">Suma XP registrando resultados reales.</p></div></div>
      </section>
    </AppShell>
  );
}
