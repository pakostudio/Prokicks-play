import { AppShell } from '@/components/AppShell';

const faqs = [
  ['¿Qué es ProKicks?', 'Una experiencia deportiva para entrenar, competir y conectar con otros jugadores en spots oficiales.'],
  ['¿Cómo creo mi perfil?', 'Entra a Crear perfil, registra tus datos, elige nickname y avatar.'],
  ['¿Cómo conecto un spot?', 'Escanea el QR del spot o ingresa el código manual del lugar.'],
  ['¿Qué es una reta?', 'Una partida abierta entre jugadores en un spot ProKicks.'],
  ['¿Cómo me registro al torneo?', 'Entra a Torneos, selecciona Indoor Community y completa el registro.'],
  ['¿Dónde es el torneo inaugural?', 'Indoor Community at Altolivo, Av. Toluca 481, Olivar de los Padres, Álvaro Obregón, CDMX.'],
  ['¿Cómo veo el flyer?', 'Desde Torneos o desde el botón Ver PDF del torneo inaugural.'],
  ['¿Cómo contacto a ProKicks?', 'Por email, WhatsApp o Instagram oficial desde la sección Contáctanos.']
];

export default function FAQPage(){
  return <AppShell active="home">
    <section className="hero section">
      <div className="kicker">ProKicks Play</div>
      <h1 className="h1">Preguntas frecuentes ProKicks</h1>
      <p className="p">Respuestas rápidas para crear perfil, conectar spots, crear retas y registrarte a torneos.</p>
    </section>
    <section className="list section">
      {faqs.map(([q,a]) => (
        <details className="card faq-item" key={q}>
          <summary className="card-title">{q}</summary>
          <p className="p">{a}</p>
        </details>
      ))}
    </section>
  </AppShell>
}
