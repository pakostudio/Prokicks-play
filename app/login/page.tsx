'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Fingerprint, ShieldCheck } from 'lucide-react';
import { supabase, passkeySupported } from '@/lib/supabase';

const supabaseAuth: any = supabase.auth;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyOffer, setPasskeyOffer] = useState(false);
  const [passkeyOfferBusy, setPasskeyOfferBusy] = useState(false);

  async function afterSignIn() {
    if (passkeySupported()) {
      try {
        const { data: passkeys } = await supabaseAuth.passkey.list();
        if (!passkeys || passkeys.length === 0) {
          setPasskeyOffer(true);
          return;
        }
      } catch {
        // si falla la consulta, seguimos sin ofrecer passkey
      }
    }
    window.location.href = '/play';
  }

  async function submit() {
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(error.message === 'Invalid login credentials'
        ? 'Correo o contraseña incorrectos.'
        : error.message);
      return;
    }
    await afterSignIn();
  }

  async function loginWithPasskey() {
    setPasskeyLoading(true);
    setMessage('');
    const { error } = await supabaseAuth.signInWithPasskey();
    setPasskeyLoading(false);
    if (error) {
      setMessage('No se pudo entrar con biométrico. Usa tu correo y contraseña, o actívalo primero desde ahí.');
      return;
    }
    window.location.href = '/play';
  }

  async function activatePasskeyNow() {
    setPasskeyOfferBusy(true);
    const { error } = await supabaseAuth.registerPasskey();
    setPasskeyOfferBusy(false);
    if (error) {
      setMessage('No se pudo activar el biométrico en este dispositivo. Puedes intentarlo después desde tu perfil.');
    }
    window.location.href = '/play';
  }

  if (passkeyOffer) {
    return (
      <main className="auth-screen">
        <div className="auth-logo-wrap">
          <Image src="/logo-negro.png" alt="ProKicks" width={160} height={54} priority />
        </div>
        <section className="auth-card">
          <h1>¡Ya entraste!</h1>
          <div className="auth-passkey-offer">
            <Fingerprint size={28} color="#173B63" />
            <strong>Activa acceso con huella o rostro</strong>
            <p>La próxima vez entras en 1 segundo, sin escribir tu contraseña. Se guarda en este dispositivo.</p>
          </div>
          {message && <div className="alert warn">{message}</div>}
          <button className="btn btn-primary btn-full" onClick={activatePasskeyNow} disabled={passkeyOfferBusy}>
            {passkeyOfferBusy ? 'Activando...' : 'Activar ahora'}
          </button>
          <button className="btn btn-soft btn-full" onClick={() => { window.location.href = '/play'; }}>
            Ahora no
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <div className="auth-logo-wrap">
        <Image src="/logo-negro.png" alt="ProKicks" width={160} height={54} priority />
        <span>Entra en segundos</span>
      </div>

      <section className="auth-card">
        <h1>Ya tengo cuenta</h1>

        <button
          className="btn btn-primary btn-full"
          onClick={loginWithPasskey}
          disabled={passkeyLoading || !passkeySupported()}
          title={passkeySupported() ? 'Entrar con huella o rostro' : 'Tu navegador no soporta biométrico'}
        >
          <Fingerprint size={20} />
          {passkeyLoading ? 'Verificando...' : 'Entrar con huella / rostro'}
        </button>

        <div className="auth-divider">o con tu correo</div>

        <div className="auth-field">
          <label>Correo</label>
          <input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="auth-field">
          <label>Contraseña</label>
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Link className="auth-forgot" href="/recuperar">¿Olvidaste tu contraseña?</Link>

        {message && <div className="alert warn">{message}</div>}

        <button className="btn btn-orange btn-full" onClick={submit} disabled={loading || !email || !password}>
          {loading ? 'Entrando...' : 'Entrar a la cancha'}
        </button>

        <p className="auth-register-hint">¿Sin cuenta? <Link href="/registro">Regístrate</Link></p>
      </section>

      <Link className="admin-link" href="/admin/login"><ShieldCheck size={14} /> Acceso admin</Link>
    </main>
  );
}
