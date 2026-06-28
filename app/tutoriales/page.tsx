import { AppShell } from '@/components/AppShell';

export default function TutorialesPage() {
  return (
    <AppShell active="play">
      <section className="hero section"><div className="kicker">Videos</div><h1 className="h1">Videos ProKicks</h1><p className="p">Tutoriales ProKicks en preparación. Aquí encontrarás jugadas, reglas, técnicas y mejores momentos.</p></section>
      <section className="grid section detail-bottom-safe">
        {['Reglas rápidas', 'Técnica street soccer', 'Mejores momentos'].map((title)=><div className="card" key={title}><span className="tag tag-warm">Próximamente</span><h2 className="card-title">{title}</h2><p className="p">Listo para conectar YouTube cuando estén los videos oficiales.</p></div>)}
      </section>
    </AppShell>
  );
}
