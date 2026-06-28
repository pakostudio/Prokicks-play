import Link from 'next/link';
import { AdminShell } from '@/components/AdminShell';

export default function AdminMaterialesPage() {
  return (
    <AdminShell active="dashboard">
      <section className="hero section">
        <div className="kicker">Admin · Materiales</div>
        <h1 className="h1">Materiales del torneo</h1>
        <p className="p">Flyers, PDFs y recursos oficiales para mostrar en la app pública.</p>
      </section>

      <section className="card section">
        <h2 className="card-title">Torneo inaugural ProKicks</h2>
        <p className="p">PDF oficial cargado en el proyecto.</p>
        <div className="grid-2 section">
          <a className="btn btn-primary" href="/docs/torneo-inaugural-prokicks-2026.pdf" target="_blank" rel="noopener noreferrer">Ver PDF</a>
          <Link className="btn btn-soft" href="/torneos">Ver en torneos</Link>
        </div>
      </section>

      <section className="card section">
        <h2 className="card-title">Subida desde admin</h2>
        <p className="p">Para subir PNG, JPG, WEBP o PDF desde este panel falta conectar Supabase Storage y permisos admin.</p>
        <p className="muted">Este paquete deja el material oficial visible y la sección lista para conectar Storage.</p>
      </section>
    </AdminShell>
  );
}
