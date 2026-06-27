import { AppShell } from '@/components/AppShell';

export default function ComunidadPage() {
  return (
    <AppShell active="play">
      <section className="hero section"><div className="kicker">Comunidad</div><h1 className="h1">Reuniones para jugar</h1><p className="p">Estructura preparada para prácticas, sede, fecha, hora y confirmación de asistencia.</p></section>
      <section className="card section detail-bottom-safe"><h2 className="card-title">Próximamente</h2><p className="p">Aquí vivirán las reuniones abiertas de la comunidad ProKicks.</p></section>
    </AppShell>
  );
}
