import { AppShell } from '@/components/AppShell';

const faqs = [
  ['¿Cómo me registro a un torneo?', 'Entra a Torneos, abre el detalle y completa el registro.'],
  ['¿Qué pasa si el torneo tiene costo?', 'Tu pre-registro queda pendiente y ProKicks te contacta para confirmar pago.'],
  ['¿Puedo registrar una dupla?', 'Sí, el formulario pide datos de ambos participantes.'],
];

export default function FaqPage() {
  return (
    <AppShell active="perfil">
      <section className="hero section"><div className="kicker">FAQ</div><h1 className="h1">Preguntas frecuentes</h1><p className="p">Base lista para administración futura.</p></section>
      <section className="list section detail-bottom-safe">
        {faqs.map(([q, a]) => <article className="card" key={q}><h2 className="card-title">{q}</h2><p className="p">{a}</p></article>)}
      </section>
    </AppShell>
  );
}
