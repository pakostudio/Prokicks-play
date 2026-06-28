import { AppShell } from '@/components/AppShell';

export default function RankingPage(){
  return <AppShell active="retas">
    <section className="hero section"><div className="kicker">Ranking</div><h1 className="h1">Ranking ProKicks en preparación</h1><p className="p">Pronto podrás ver puntos, posiciones y evolución por jugador.</p></section>
    <section className="grid section">
      <div className="card"><span className="tag tag-warm">Próximamente</span><h2 className="card-title">XP por retas</h2><p className="p">Puntos por participar, ganar y completar torneos.</p></div>
      <div className="card"><span className="tag tag-blue">En preparación</span><h2 className="card-title">Badges y recompensas</h2><p className="p">Gana XP, badges y recompensas por participar en retas y torneos.</p></div>
    </section>
  </AppShell>
}
