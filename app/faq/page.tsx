'use client';

import Link from 'next/link';
import { AppShell } from '@/components/AppShell';

type FaqItem = { q: string; a: string };
type FaqGroup = { title: string; items: FaqItem[] };

const FAQ_GROUPS: FaqGroup[] = [
  {
    title: 'Perfil y registro',
    items: [
      { q: '¿Cómo creo mi perfil?', a: 'Ve a Perfil y toca "Crear perfil". Solo necesitas nombre, WhatsApp, nickname y avatar. La estatura es opcional, pero la usamos para calibrar tus mediciones ProX.' },
      { q: '¿Puedo editar mis datos después?', a: 'Sí, desde Perfil toca "Editar / recrear perfil" y tus datos actuales se precargan automáticamente.' },
    ],
  },
  {
    title: 'Spots y QR',
    items: [
      { q: '¿Qué es un Spot?', a: 'Es una cancha o punto de juego registrado en ProKicks Play. Puedes verlos en el mapa desde la pestaña Spots.' },
      { q: '¿Para qué sirve escanear el QR?', a: 'Al escanear el QR de un Spot te conectas a ese lugar: puedes ver quién está jugando ahí y sumarte a retas o torneos activos en ese sitio.' },
    ],
  },
  {
    title: 'Retas',
    items: [
      { q: '¿Qué es una reta?', a: 'Es un reto 1v1 o de equipo entre jugadores. Se crea desde la pestaña Inicio o desde un Spot y cualquier jugador con perfil puede aceptarla.' },
      { q: '¿Necesito estar en un Spot para crear una reta?', a: 'No es obligatorio, pero si la creas desde un Spot conectado es más fácil que otros jugadores cercanos la vean.' },
    ],
  },
  {
    title: 'Torneos',
    items: [
      { q: '¿Cómo me inscribo a un torneo?', a: 'Entra a la pestaña Torneos, elige el torneo y toca "Inscríbete aquí". Vas a necesitar tu perfil creado.' },
      { q: '¿Qué es el check-in y la firma de responsiva?', a: 'El día del torneo, el check-in confirma tu llegada en 2 pasos y la firma de responsiva es un documento digital que firmas con el dedo para participar de forma segura.' },
      { q: '¿Cómo comparto un torneo con mis amigos?', a: 'Desde la pantalla del torneo toca "Compartir torneo" y se genera un link para enviar por WhatsApp o cualquier app.' },
    ],
  },
  {
    title: 'ProX (medición con cámara)',
    items: [
      { q: '¿Qué es ProX?', a: 'Es el módulo que mide tu desempeño físico usando la cámara de tu celular y un modelo de inteligencia artificial (TensorFlow.js) que corre 100% en tu dispositivo. Nada se graba ni se sube a internet.' },
      { q: '¿Qué mide exactamente?', a: 'Salto (altura), velocidad y desplazamiento lateral, consistencia de movimiento, tiempo de reacción y una aproximación de habilidad técnica (suavidad de movimiento). Aún no mide contacto real con el balón.' },
      { q: '¿Por qué me pide mi estatura?', a: 'La estatura calibra la escala de píxeles a centímetros para que las mediciones sean precisas. Puedes dejarla en blanco y agregarla después desde tu perfil.' },
      { q: '¿Necesito estar registrado para usar ProX?', a: 'Sí, ProX es exclusivo para jugadores con perfil creado. Si no tienes uno, te vamos a pedir que lo crees primero.' },
      { q: '¿Dónde veo mis resultados?', a: 'Al terminar la medición te lleva automáticamente a Resultados, donde ves tus 6 métricas comparadas contra el promedio de la comunidad.' },
    ],
  },
];

export default function FaqPage() {
  return (
    <AppShell active="perfil">
      <section className="hero section">
        <div className="kicker">Ayuda</div>
        <h1 className="h1">Preguntas frecuentes</h1>
        <p className="p">Resuelve tus dudas sobre cómo funciona ProKicks Play.</p>
      </section>
      {FAQ_GROUPS.map((group) => (
        <section className="card section" key={group.title}>
          <h2 className="card-title">{group.title}</h2>
          <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
            {group.items.map((item) => (
              <details key={item.q} style={{ border: '1px solid #E2E8F0', borderRadius: 14, padding: '10px 14px', background: '#F8FAFC' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 800, color: '#173B63', listStyle: 'none' }}>{item.q}</summary>
                <p className="p" style={{ marginTop: 8 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
      <section className="section">
        <Link href="/perfil" className="btn btn-soft btn-full">Volver a Perfil</Link>
      </section>
    </AppShell>
  );
}
