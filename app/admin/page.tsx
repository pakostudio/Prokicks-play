import Link from 'next/link';
import { AppShell } from '@/components/AppShell';

export default function AdminPage(){
  return <AppShell active="perfil">
    <section className="hero section"><div className="kicker">Admin</div><h1 className="h1">Control ProKicks</h1><p className="p">Operación básica del MVP para revisión con cliente.</p></section>
    <section className="grid-2 section">
      <div className="stat"><span className="muted">Usuarios</span><strong>Export</strong></div>
      <div className="stat"><span className="muted">Spots</span><strong>3</strong></div>
      <div className="stat"><span className="muted">QR</span><strong>3</strong></div>
      <div className="stat"><span className="muted">Torneos</span><strong>Demo</strong></div>
    </section>
    <section className="grid section">
      <Link className="btn btn-primary" href="/admin/export">Exportar base CSV / Excel / PDF</Link>
      <Link className="btn btn-soft" href="/admin/spots">Gestionar spots / QR</Link>
      <Link className="btn btn-soft" href="/admin/retas">Gestionar retas</Link>
      <Link className="btn btn-warm" href="/torneos">Ver torneos demo</Link>
    </section>
  </AppShell>
}
