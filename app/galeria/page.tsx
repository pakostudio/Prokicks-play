import { AppShell } from '@/components/AppShell';

export default function GaleriaPage() {
  return (
    <AppShell active="play">
      <section className="hero section"><div className="kicker">Galería</div><h1 className="h1">Galería oficial ProKicks</h1><p className="p">Próximamente fotos por torneo y retas destacadas.</p></section>
      <section className="grid section detail-bottom-safe">
        {['Indoor Community', 'Retas destacadas', 'Crew ProKicks'].map((title)=><div className="card" key={title}><span className="tag tag-blue">En preparación</span><h2 className="card-title">{title}</h2><p className="p">Cloudinary completo queda para después.</p></div>)}
      </section>
    </AppShell>
  );
}
