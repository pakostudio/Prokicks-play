import { AppShell } from '@/components/AppShell';
import { demoRanking } from '@/lib/demo';

export default function RankingPage(){
  return <AppShell active="retas">
    <section className="hero section"><div className="kicker">Ranking</div><h1 className="h1">Tabla ProKicks</h1><p className="p">XP, victorias y progreso.</p></section>
    <section className="list section">
      {demoRanking.map((r,i)=><div className="card rank-row" key={r.name}>
        <div className="rank-pos">{i+1}</div><div><h3 className="card-title">{r.name}</h3><p className="p">{r.city} · {r.wins} victorias</p></div><strong>{r.xp} XP</strong>
      </div>)}
    </section>
  </AppShell>
}
