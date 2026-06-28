import { AppShell } from '@/components/AppShell';

const faqs = [
  ['¿Qué es ProKicks Play?', 'La app para conectar jugadores, spots, retas y torneos ProKicks.'],
  ['¿Cómo me registro?', 'Entra a Registrarme, captura tus datos básicos y crea tu perfil ProKicks.'],
  ['¿Cómo creo mi nickname?', 'En el registro eliges tu nickname público para retas y torneos.'],
  ['¿Cómo elijo mi avatar?', 'En el registro verás la galería de avatares ProKicks y puedes seleccionar uno.'],
  ['¿Cómo me registro a un torneo?', 'Entra a Torneos, abre el detalle y completa el registro.'],
  ['¿Cómo conecto un spot?', 'Entra a QR, ingresa el código del spot y confirma el lugar.'],
  ['¿Qué es una reta?', 'Una reta es un partido abierto asociado a un spot ProKicks.'],
  ['¿Dónde veo el reglamento?', 'En Legal puedes consultar reglamento y uso de imagen.'],
  ['¿Cómo contacto a ProKicks?', 'En Contáctanos tienes email y WhatsApp directo.'],
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
