import Link from 'next/link';
import { AdminShell } from '@/components/AdminShell';
import { Trophy, FileText, QrCode, BarChart3, Users, GraduationCap, Zap, MapPin, Image as ImageIcon, Video, Download, Globe2 } from 'lucide-react';

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
      <div className="admin-quicklinks">
        <Link className="admin-quicklink" href="/admin/torneos"><Trophy size={16} /><span>Crear / editar torneos</span></Link>
        <Link className="admin-quicklink" href="/admin/registros-torneos"><FileText size={16} /><span>Ver registros a torneos</span></Link>
        <Link className="admin-quicklink" href="/admin/check-in"><QrCode size={16} /><span>Check-in QR</span></Link>
        <Link className="admin-quicklink" href="/admin/resultados"><BarChart3 size={16} /><span>Resultados</span></Link>
      </div>
    </section>

    <section className="section">
      <h2 className="h2">Comunidad</h2>
      <div className="admin-quicklinks">
        <Link className="admin-quicklink" href="/admin/usuarios"><Users size={16} /><span>Ver perfiles registrados</span></Link>
        <Link className="admin-quicklink" href="/admin/clinicas"><GraduationCap size={16} /><span>Clínicas · Lista de interés</span></Link>
        <Link className="admin-quicklink" href="/admin/retas"><Zap size={16} /><span>Ver retas creadas</span></Link>
        <Link className="admin-quicklink" href="/admin/spots"><MapPin size={16} /><span>Crear / editar spots</span></Link>
      </div>
    </section>

    <section className="section">
      <h2 className="h2">Contenido</h2>
      <div className="admin-quicklinks">
        <Link className="admin-quicklink" href="/admin/galeria"><ImageIcon size={16} /><span>Galería / fotos</span></Link>
        <Link className="admin-quicklink" href="/admin/videos"><Video size={16} /><span>Videos YouTube</span></Link>
      </div>
    </section>

    <section className="section">
      <h2 className="h2">Datos</h2>
      <div className="admin-quicklinks">
        <Link className="admin-quicklink" href="/admin/export"><Download size={16} /><span>Exportar base CSV / Excel / PDF</span></Link>
        <Link className="admin-quicklink" href="/torneos"><Globe2 size={16} /><span>Ver torneos públicos</span></Link>
      </div>
    </section>
  </AdminShell>
  }
