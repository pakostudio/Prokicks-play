import Link from 'next/link';
import { AppShell } from '@/components/AppShell';

export default function AdminPage(){
  return <AppShell active="perfil">
    <section className="hero section">
      <div className="kicker">Admin</div>
      <h1 className="h1">Control ProKicks</h1>
      <p className="p">Panel operativo del MVP para torneos, registros y exportación.</p>
    </section>
    <section className="grid-2 section">
      <div className="stat"><span className="muted">Torneos</span><strong>Crear / Editar</strong></div>
      <div className="stat"><span className="muted">Registros</span><strong>Participantes</strong></div>
      <div className="stat"><span className="muted">Perfiles</span><strong>Usuarios</strong></div>
      <Link className="stat admin-stat-link" href="/admin/spots"><span className="muted">Spots</span><strong>QR / Sedes</strong></Link>
    </section>
    <section className="grid section">
      <Link className="btn btn-primary" href="/admin/torneos">Crear / editar torneos</Link>
      <Link className="btn btn-soft" href="/admin/registros-torneos">Ver registros a torneos</Link>
      <Link className="btn btn-soft" href="/admin/usuarios">Ver perfiles registrados</Link>
      <Link className="btn btn-soft" href="/admin/retas">Ver retas creadas</Link>
      <Link className="btn btn-soft" href="/admin/spots">Crear / editar spots</Link>
      <Link className="btn btn-soft" href="/admin/check-in">Check-in QR</Link>
      <Link className="btn btn-soft" href="/admin/galeria">Galería / fotos</Link>
      <Link className="btn btn-soft" href="/admin/videos">Videos YouTube</Link>
      <Link className="btn btn-soft" href="/admin/resultados">Resultados</Link>
      <Link className="btn btn-soft" href="/admin/export">Exportar base CSV / Excel / PDF</Link>
      <Link className="btn btn-warm" href="/torneos">Ver torneos públicos</Link>
    </section>
  </AppShell>
}
