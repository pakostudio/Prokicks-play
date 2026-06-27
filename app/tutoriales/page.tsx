import { AppShell } from '@/components/AppShell';

export default function TutorialesPage() {
  return (
    <AppShell active="play">
      <section className="hero section"><div className="kicker">Tutoriales</div><h1 className="h1">Videos ProKicks</h1><p className="p">Base preparada para enlaces de YouTube y administración futura.</p></section>
      <section className="card section detail-bottom-safe"><h2 className="card-title">Biblioteca</h2><p className="p">Los videos se conectarán cuando esté definido el canal oficial.</p></section>
    </AppShell>
  );
}
