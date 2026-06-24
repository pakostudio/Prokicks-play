import { AppShell } from '@/components/AppShell';
import { demoSpots } from '@/lib/demo';

export default function AdminSpots(){
  return <AppShell active="perfil"><section className="hero section"><div className="kicker">Admin</div><h1 className="h1">Spots / QR</h1></section><section className="list section">{demoSpots.map((s,i)=><div className="card" key={s.id}><div className="row"><h3 className="card-title">{s.name}</h3><span className="tag tag-blue">PK-{i+1}</span></div><p className="p">QR demo: {i===0?'PK-ROMA-001':i===1?'PK-POLANCO-001':'PK-COYO-001'}</p></div>)}</section></AppShell>
}
