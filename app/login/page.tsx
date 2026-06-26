'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Eye, Lock, Users, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SupabaseNotice } from '@/components/SupabaseNotice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = '/play';
  }

  return (
    <main className="access-screen">
      <SupabaseNotice />

      <section className="access-hero">
        <div className="hero-bg-players" aria-hidden="true">
          <span className="player player-left" />
          <span className="player player-right" />
        </div>
        <div className="hero-line" />
        <div className="hero-copyline">Donde empieza<br />el juego</div>
        <Image
          src="/prokicks-hero.jpeg"
          alt="Mesa ProKicks"
          width={900}
          height={600}
          priority
          className="product-hero-img"
        />
      </section>

      <section className="access-content">
        <div className="access-title">
          <h1>Bienvenido</h1>
          <p>Conecta, juega y forma parte de la comunidad ProKicks.</p>
        </div>

        <section className="login-card">
          <h2>¿Ya estás registrado?</h2>
          <p>Ingresa con tu usuario y contraseña</p>

          <label className="field-control">
            <UserRound size={22} />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Usuario o correo"
              type="email"
              autoComplete="email"
            />
          </label>

          <label className="field-control">
            <Lock size={22} />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              type="password"
              autoComplete="current-password"
            />
            <Eye size={22} className="field-extra" />
          </label>

          <Link className="forgot-link" href="/recuperar">¿Olvidaste tu contraseña?</Link>
          {message && <div className="alert error">{message}</div>}
          <button className="btn-login" onClick={submit} disabled={loading}>
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </section>

        <div className="register-block">
          <p>¿Aún no tienes cuenta?</p>
          <Link className="btn-register" href="/registro">Regístrate</Link>
        </div>

        <div className="or-divider"><span />o<span /></div>

        <Link className="guest-card" href="/guest">
          <Users size={25} />
          <div>
            <strong>Entrar como invitado</strong>
            <p>Conoce la experiencia ProKicks antes de registrarte</p>
          </div>
          <span className="guest-arrow">›</span>
        </Link>
      </section>
    </main>
  );
}
