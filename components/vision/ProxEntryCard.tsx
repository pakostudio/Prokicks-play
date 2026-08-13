'use client';

import Link from 'next/link';
import { Smartphone } from 'lucide-react';

// Tarjeta de acceso a ProX: mediciones individuales con celular + tripie.
// Se inserta junto a VisionEntryCard en /play.
export function ProxEntryCard() {
  return (
    <article className="card prox-entry-card">
      <div className="row">
        <h3 className="card-title">ProKicks ProX</h3>
        <span className="tag tag-amber">Nuevo</span>
      </div>
      <p className="p">Mide tu salto, desplazamiento lateral y habilidad con solo tu celular.</p>
      <Link className="btn btn-primary btn-full" href="/prox">
        <Smartphone size={18} /> Ver mis mediciones ProX
      </Link>
    </article>
  );
}
