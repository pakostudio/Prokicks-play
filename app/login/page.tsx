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
    <main className="access-screen approved-access-screen">
      <SupabaseNotice />

      <section className="approved-hero" aria-label="Portada ProKicks">
        <Image
          src="/prokicks-approved-hero.jpeg"
          alt="ProKicks: donde empieza el juego"
          fill
          priority
          sizes="(max-width: 520px) 100vw, 480px"
          className="approved-hero-image"
        />
      </section>

      <section className="access-content approved-access-content">
        <div className="access-title approved-access-title">
          <h1>Bienvenido</h1>
          <p>Conecta, juega y forma parte de la comunidad ProKicks.</p>
        </div>

        <section className="login-card approved-login-card">
          <h2>¿Ya estás registrado?</h2>
          <p>Ingresa con tu usuario y contraseña</p>

          <label className="field-control approved-field-control">
            <UserRound size={24} />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Usuario o correo"
              type="email"
              autoComplete="email"
            />
          </label>

          <label className="field-control approved-field-control">
            <Lock size={24} />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              type="password"
              autoComplete="current-password"
            />
            <Eye size={24} className="field-extra" />
          </label>

          <Link className="forgot-link" href="/recuperar">¿Olvidaste tu contraseña?</Link>
          {message && <div className="alert error">{message}</div>}
          <button className="btn-login approved-btn-login" onClick={submit} disabled={loading}>
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </section>

        <div className="register-block approved-register-block">
          <p>¿Aún no tienes cuenta?</p>
          <Link className="btn-register approved-btn-register" href="/registro">Regístrate</Link>
        </div>

        <div className="or-divider approved-or-divider"><span />o<span /></div>

        <Link className="guest-card approved-guest-card" href="/guest">
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
