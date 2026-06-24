import Link from 'next/link';
import { AppShell } from '@/components/AppShell';

export default function AdminPage(){
  return <AppShell active="perfil">
    <section className="hero section"><div className="kicker">Admin</div><h1 className="h1">Control ProKicks</h1><p className="p">Operación básica del MVP.</p></section>
    <section className="grid-2 section">
      <div className="stat"><span className="muted">Usuarios</span><strong>Demo</strong></div>
      <div className="stat"><span className="muted">Spots</span><strong>3</strong></div>
      <div className="stat"><span className="muted">QR</span><strong>3</strong></div>
      <div className="stat"><span className="muted">Retas</span><strong>2</strong></div>
    </section>
    <section className="grid section"><Link className="btn btn-primary" href="/admin/spots">Gestionar spots / QR</Link><Link className="btn btn-warm" href="/admin/retas">Gestionar retas</Link></section>
  </AppShell>
}
