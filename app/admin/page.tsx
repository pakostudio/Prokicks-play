import Link from 'next/link';
import { AdminShell } from '@/components/AdminShell';

export default function AdminPage(){
  return <AdminShell active="dashboard">
    <section className="hero section">
      <div className="kicker">Admin</div>
      <h1 className="h1">Control ProKicks</h1>
      <p className="p">Panel operativo para torneos, registros, usuarios, retas, spots y materiales.</p>
    </section>

    <section className="grid-2 section">
      <Link className="stat admin-stat-link" href="/admin/torneos"><span className="muted">Torneos</span><strong>Crear / Editar</strong></Link>
      <Link className="stat admin-stat-link" href="/admin/registros-torneos"><span className="muted">Registros</span><strong>Participantes</strong></Link>
      <Link className="stat admin-stat-link" href="/admin/usuarios"><span className="muted">Perfiles</span><strong>Usuarios</strong></Link>
      <Link className="stat admin-stat-link" href="/admin/spots"><span className="muted">Retas</span><strong>Spots</strong></Link>
    </section>

    <section className="grid section">
      <Link className="btn btn-primary" href="/admin/torneos">Crear / editar torneos</Link>
      <Link className="btn btn-soft" href="/admin/registros-torneos">Ver registros a torneos</Link>
      <Link className="btn btn-soft" href="/admin/usuarios">Ver perfiles registrados</Link>
      <Link className="btn btn-soft" href="/admin/retas">Ver retas creadas</Link>
      <Link className="btn btn-soft" href="/admin/spots">Editar spots / QR</Link>
      <Link className="btn btn-secondary-blue" href="/admin/materiales">Materiales / flyers</Link>
      <Link className="btn btn-soft" href="/admin/export">Exportar base CSV / Excel / PDF</Link>
      <Link className="btn btn-secondary-blue" href="/torneos">Ver torneos públicos</Link>
    </section>
  </AdminShell>
}
