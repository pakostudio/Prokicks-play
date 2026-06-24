import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { demoChallenges } from '@/lib/demo';

export default function RetaDetail({ params }:{ params:{ id:string }}){
  const reta = demoChallenges.find(c=>c.id===params.id) || demoChallenges[0];
  return <AppShell active="retas">
    <section className="hero section"><div className="kicker">Detalle de reta</div><h1 className="h1">{reta.title}</h1><p className="p">{reta.spot_name} · {reta.type} · {reta.level}</p></section>
    <section className="grid-2 section">
      <div className="stat"><span className="muted">Estado</span><strong style={{fontSize:18}}>{reta.status}</strong></div>
      <div className="stat"><span className="muted">Tipo</span><strong>{reta.type}</strong></div>
    </section>
    <section className="grid section">
      <Link className="btn btn-primary btn-full" href={`/resultado?challenge=${reta.id}`}>Registrar resultado</Link>
      <button className="btn btn-warm btn-full">Unirme</button>
      <Link className="btn btn-soft btn-full" href="/retas">Volver</Link>
    </section>
  </AppShell>
}
