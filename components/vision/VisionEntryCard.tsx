'use client';

import Link from 'next/link';
import { Camera, History } from 'lucide-react';

// Tarjeta de acceso a ProKicks Vision, pensada para insertarse en /play.
// No se agrega todavía al menú inferior (bottom-nav), según lo pedido.
export function VisionEntryCard() {
  return (
    <article className="card vision-entry-card">
      <div className="row">
        <h3 className="card-title">ProKicks Vision</h3>
        <span className="tag tag-blue">Beta</span>
      </div>
      <p className="p">Entrenamiento inteligente y rendimiento por jugador.</p>
      <div className="grid-2">
        <Link className="btn btn-primary" href="/vision/nueva-sesion">
          <Camera size={18} /> Iniciar sesión
        </Link>
        <Link className="btn btn-soft" href="/vision/historial">
          <History size={18} /> Ver historial
        </Link>
      </div>
    </article>
  );
}
