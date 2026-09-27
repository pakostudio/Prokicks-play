'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Fingerprint, ShieldCheck } from 'lucide-react';
import { supabase, passkeySupported } from '@/lib/supabase';

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
                          const { data: passkeys } = await supabase.auth.passkey.list();
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
                                   ? 'Correo o contrasena incorrectos.'
                                   : error.message);
                return;
        }
        await afterSignIn();
  }

  async function loginWithPasskey() {
        setPasskeyLoading(true);
        setMessage('');
        const { error } = await supabase.auth.signInWithPasskey();
        setPasskeyLoading(false);
        if (error) {
                setMessage('No se pudo entrar con biometrico. Usa tu correo y contrasena, o activalo primero desde ahi.');
                return;
        }
        window.location.href = '/play';
  }

  async function activatePasskeyNow() {
        setPasskeyOfferBusy(true);
        const { error } = await supabase.auth.registerPasskey();
        setPasskeyOfferBusy(false);
        if (error) {
                setMessage('No se pudo activar el biometrico en este dispositivo. Puedes intentarlo despues desde tu perfil.');
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
                                  <h1>Ya entraste</h1>
                                  <div className="auth-passkey-offer">
                                              <Fingerprint size={28} color="#173B63" />
                                              <strong>Activa acceso con huella o rostro</strong>
                                              <p>La proxima vez entras en 1 segundo, sin escribir tu contrasena. Se guarda en este dispositivo.</p>
                                  </div>
                          {message && <div className="alert warn">{message}</div>
                          }
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
                                    title="Entrar con huella o rostro"
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
                                  <label>Contrasena</label>
                                  <input type="password" placeholder="Contrasena" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <Link className="auth-forgot" href="/recuperar">Olvidaste tu contrasena?</Link>
                  {message && <div className="alert warn">{message}</div>
                  }
                        <button className="btn btn-orange btn-full" onClick={submit} disabled={loading || !email || !password}>
                          {loading ? 'Entrando...' : 'Entrar a la cancha'}
                        </button>
                        <p className="auth-register-hint">Sin cuenta? <Link href="/registro">Registrate</Link>
                        </p>
                </section>
                <Link className="admin-link" href="/admin/login"><ShieldCheck size={14} /> Acceso admin</Link>
          </main>
        );
}
</main>
