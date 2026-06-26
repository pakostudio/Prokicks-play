import { AppShell } from '@/components/AppShell';
import { demoChallenges } from '@/lib/demo';

export default function AdminRetas(){
  return <AppShell active="perfil"><section className="hero section"><div className="kicker">Admin</div><h1 className="h1">Retas</h1></section><section className="list section">{demoChallenges.map(c=><div className="card" key={c.id}><div className="row"><h3 className="card-title">{c.title}</h3><span className="tag tag-warm">{c.status}</span></div><p className="p">Validar, editar o cancelar después.</p></div>)}</section></AppShell>
}
