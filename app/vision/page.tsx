'use client';

import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Camera, History } from 'lucide-react';

export default function VisionHomePage() {
  return (
    <AppShell active="home">
      <section className="hero section">
        <div className="kicker">ProKicks Vision</div>
        <h1 className="h1">Entrenamiento inteligente</h1>
        <p className="p">
          Registra, calibra y ejecuta sesiones de entrenamiento con hasta 4 jugadores y 2 cámaras, y
          consulta el rendimiento por jugador.
        </p>
        <div className="grid-2 section">
          <Link className="btn btn-primary" href="/vision/nueva-sesion">
            <Camera size={18} /> Nueva sesión
          </Link>
          <Link className="btn btn-soft" href="/vision/historial">
            <History size={18} /> Historial
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="card">
          <h3 className="card-title">Cómo funciona</h3>
          <p className="p">1. Crea una nueva sesión y selecciona de 1 a 4 jugadores.</p>
          <p className="p">2. Conecta hasta 2 cámaras y calibra la detección de cada jugador.</p>
          <p className="p">3. Corre bloques de 20 minutos con temporizador, pausa y métricas en vivo.</p>
          <p className="p">4. Consulta resultados y evolución histórica por jugador.</p>
        </div>
      </section>
    </AppShell>
  );
}
