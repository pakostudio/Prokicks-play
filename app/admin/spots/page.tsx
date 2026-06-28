import { AdminShell } from '@/components/AdminShell';
import { realSpots } from '@/lib/demo';

export default function AdminSpots(){
  return <AdminShell active="spots"><section className="hero section"><div className="kicker">Admin</div><h1 className="h1">Spots / QR</h1></section><section className="list section">{realSpots.map((s)=><div className="card" key={s.id}><div className="row"><h3 className="card-title">{s.name}</h3><span className="tag tag-blue">{s.code}</span></div><p className="p">{s.address}</p></div>)}</section></AdminShell>
}
