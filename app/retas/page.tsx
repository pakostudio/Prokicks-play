import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { demoChallenges } from '@/lib/demo';

export default function RetasPage(){
  return <AppShell active="retas">
    <section className="hero section"><div className="kicker">Retas</div><h1 className="h1">Compite cerca</h1><p className="p">Únete o crea una reta rápida.</p></section>
    <Link className="btn btn-primary btn-full section" href="/retas/nueva">Crear nueva reta</Link>
    <section className="list section">
      {demoChallenges.map(c=><Link className="card" href={`/retas/${c.id}`} key={c.id}>
        <div className="row"><h3 className="card-title">{c.title}</h3><span className="tag tag-warm">{c.status}</span></div>
        <p className="p">{c.spot_name} · {c.type} · {c.level}</p>
      </Link>)}
    </section>
  </AppShell>
}
