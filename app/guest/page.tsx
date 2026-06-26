import Link from 'next/link';
import { Map, QrCode, Swords, Trophy } from 'lucide-react';

export default function GuestPage() {
  const items = [
    { icon: QrCode, title: 'Escanea QR', text: 'Conecta el dispositivo físico con el spot.' },
    { icon: Map, title: 'Encuentra spots', text: 'Explora dónde jugar cerca de ti.' },
    { icon: Swords, title: 'Crea retas', text: 'Únete a partidas o reta a otros.' },
    { icon: Trophy, title: 'Sube ranking', text: 'Registra resultados y gana XP.' }
  ];

  return (
    <main className="guest-screen">
      <section className="guest-hero">
        <span>Modo invitado</span>
        <h1>Conoce ProKicks Play</h1>
        <p>Explora la experiencia antes de registrarte. Para crear retas, guardar resultados o subir ranking necesitarás una cuenta.</p>
      </section>
      <section className="guest-list">
        {items.map((item) => {
          const Icon = item.icon;
          return <article className="guest-item" key={item.title}><Icon /><div><h2>{item.title}</h2><p>{item.text}</p></div></article>;
        })}
      </section>
      <section className="guest-actions">
        <Link className="btn btn-primary btn-full" href="/registro">Registrarme</Link>
        <Link className="btn btn-soft btn-full" href="/play">Seguir como invitado</Link>
      </section>
    </main>
  );
}
