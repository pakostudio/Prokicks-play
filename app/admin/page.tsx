import Link from 'next/link';
import { AdminShell } from '@/components/AdminShell';

export default function AdminPage(){
  return <AdminShell active="dashboard">
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

    <section className="section">
      <h2 className="h2">Torneos</h2>
      <div className="grid-2">
        <Link className="btn btn-primary" href="/admin/torneos">Crear / editar torneos</Link>
        <Link className="btn btn-soft" href="/admin/registros-torneos">Ver registros a torneos</Link>
        <Link className="btn btn-soft" href="/admin/check-in">Check-in QR</Link>
        <Link className="btn btn-soft" href="/admin/resultados">Resultados</Link>
      </div>
    </section>

    <section className="section">
      <h2 className="h2">Comunidad</h2>
      <div className="grid-2">
        <Link className="btn btn-soft" href="/admin/usuarios">Ver perfiles registrados</Link>
        <Link className="btn btn-soft" href="/admin/clinicas">Clínicas · Lista de interés</Link>
        <Link className="btn btn-soft" href="/admin/retas">Ver retas creadas</Link>
        <Link className="btn btn-soft" href="/admin/spots">Crear / editar spots</Link>
      </div>
    </section>

    <section className="section">
      <h2 className="h2">Contenido</h2>
      <div className="grid-2">
        <Link className="btn btn-soft" href="/admin/galeria">Galería / fotos</Link>
        <Link className="btn btn-soft" href="/admin/videos">Videos YouTube</Link>
      </div>
    </section>

    <section className="section">
      <h2 className="h2">Datos</h2>
      <div className="grid-2">
        <Link className="btn btn-soft" href="/admin/export">Exportar base CSV / Excel / PDF</Link>
        <Link className="btn btn-warm" href="/torneos">Ver torneos públicos</Link>
      </div>
    </section>
  </AdminShell>
}
