import Link from 'next/link';
import { AppShell } from '@/components/AppShell';

export default function PerfilPage(){
  return <AppShell active="perfil">
    <section className="hero section"><div className="kicker">Jugador</div><h1 className="h1">Perfil ProKicks</h1><p className="p">Tu identidad, stats y actividad.</p></section>
    <section className="grid-2 section">
      <div className="stat"><span className="muted">XP</span><strong>1280</strong></div>
      <div className="stat"><span className="muted">Victorias</span><strong>14</strong></div>
      <div className="stat"><span className="muted">Retas</span><strong>21</strong></div>
      <div className="stat"><span className="muted">Ranking</span><strong>#1</strong></div>
    </section>
    <section className="grid section"><Link href="/onboarding" className="btn btn-soft">Editar perfil</Link><Link href="/ranking" className="btn btn-primary">Ver ranking</Link></section>
  </AppShell>
}
