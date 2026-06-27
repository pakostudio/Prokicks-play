import { AppShell } from '@/components/AppShell';

export default function GaleriaPage() {
  return (
    <AppShell active="play">
      <section className="hero section"><div className="kicker">Galería</div><h1 className="h1">Fotos por torneo</h1><p className="p">Estructura lista para Cloudinary. Drive queda fuera como solución final.</p></section>
      <section className="card section detail-bottom-safe"><h2 className="card-title">Álbumes</h2><p className="p">Los álbumes aparecerán por torneo cuando se conecte el storage.</p></section>
    </AppShell>
  );
}
