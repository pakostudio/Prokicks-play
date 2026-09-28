'use client';

import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { supabase, passkeySupported } from '@/lib/supabase';
import { avatarOptions } from '@/lib/demo';

const supabaseAuth: any = supabase.auth;

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.1 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.5 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.1 6 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2.1 1.5-4.7 2.4-7.2 2.4-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C40.3 36 44 30.7 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 384 512" fill="#fff">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM256.8 88.7c27-32.1 24.6-61.4 23.8-71.9-23.9 1.4-51.6 16.4-67.3 34.9-17.3 19.8-27.5 44.3-25.3 71.9 26.3 2 50.3-11.2 68.8-34.9z" />
    </svg>
  );
}

function FaceIdIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M7 3H5a2 2 0 0 0-2 2v2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M17 21h2a2 2 0 0 0 2-2v-2" />
      <circle cx="8.5" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="10" r="1" fill="currentColor" stroke="none" />
      <path d="M9 15c1 1 5 1 6 0" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [suNickname, setSuNickname] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suMessage, setSuMessage] = useState('');
  const [suLoading, setSuLoading] = useState(false);

  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyOffer, setPasskeyOffer] = useState(false);
  const [passkeyOfferBusy, setPasskeyOfferBusy] = useState(false);
  const [canPasskey, setCanPasskey] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileWidgetId = useRef<string | null>(null);

  useEffect(() => {
    setCanPasskey(passkeySupported());
  }, []);

  function oauthRedirect() {
    return typeof window !== 'undefined' ? `${window.location.origin}/play` : undefined;
  }

  function renderTurnstile() {
    const w: any = window;
    if (!w.turnstile) return;
    const el = document.getElementById('turnstile-container');
    if (!el || turnstileWidgetId.current) return;
    turnstileWidgetId.current = w.turnstile.render(el, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      callback: (token: string) => setTurnstileToken(token),
      'error-callback': () => setTurnstileToken(''),
      'expired-callback': () => setTurnstileToken(''),
    });
  }

  useEffect(() => {
    if (passkeyOffer) return;
    let cancelled = false;
    function tryRender() {
      if (cancelled) return;
      const w: any = window;
      if (w.turnstile) {
        renderTurnstile();
      } else {
        setTimeout(tryRender, 300);
      }
    }
    tryRender();
    return () => { cancelled = true; };
  }, [passkeyOffer]);

  async function verifyTurnstile(setMsg: (s: string) => void): Promise<boolean> {
    if (!turnstileToken) {
      setMsg('Verifica que no eres un robot antes de continuar.');
      return false;
    }
    try {
      const res = await fetch('/api/turnstile-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const json = await res.json();
      if (!json.success) {
        setMsg('No se pudo verificar la seguridad. Intenta de nuevo.');
        const w: any = window;
        if (w.turnstile && turnstileWidgetId.current) w.turnstile.reset(turnstileWidgetId.current);
        setTurnstileToken('');
        return false;
      }
      return true;
    } catch {
      setMsg('No se pudo verificar la seguridad. Intenta de nuevo.');
      return false;
    }
  }

  async function withGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: oauthRedirect() } });
  }

  async function withApple() {
    await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: oauthRedirect() } });
  }

  async function afterSignIn() {
    if (canPasskey) {
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

  async function submitLogin() {
    if (!(await verifyTurnstile(setMessage))) return;
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

  async function submitSignup() {
    setSuMessage('');
    if (suNickname.trim().length < 3 || !suEmail.trim() || suPassword.length < 6) {
      setSuMessage('Completa nickname, correo y una contraseña de al menos 6 caracteres.');
      return;
    if (!(await verifyTurnstile(setSuMessage))) return;
    }
    setSuLoading(true);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: suEmail.trim().toLowerCase(),
      password: suPassword,
    });

    if (signUpError || !signUpData.user) {
      setSuLoading(false);
      setSuMessage(
        signUpError?.message.includes('already registered') || signUpError?.message.includes('already been registered')
          ? 'Ese correo ya tiene una cuenta ProKicks. Usa "Ya tienes cuenta".'
          : signUpError?.message || 'No se pudo crear la cuenta. Intenta de nuevo.'
      );
      return;
    }

    const avatar = avatarOptions[0];
    const profile = {
      id: signUpData.user.id,
      name: suNickname.trim(),
      email: suEmail.trim().toLowerCase(),
      whatsapp: '',
      nickname: suNickname.trim(),
      avatar_id: avatar.id,
      avatar_name: avatar.name,
      avatar_image: avatar.image,
    };

    let { error } = await supabase.from('prokicks_profiles').insert(profile);
    if (error && String(error.message || '').includes('avatar_image')) {
      const { avatar_image, ...profileWithoutImage } = profile;
      const retry = await supabase.from('prokicks_profiles').insert(profileWithoutImage);
      error = retry.error;
    }
    setSuLoading(false);

    if (signUpData.session) {
      await afterSignIn();
      return;
    }
    setSuMessage('Cuenta creada. Revisa tu correo para confirmar y luego entra con tu contraseña.');
  }

  async function loginWithPasskey() {
    setPasskeyLoading(true);
    setMessage('');
    try {
      const { error } = await supabaseAuth.signInWithPasskey();
      setPasskeyLoading(false);
      if (error) {
        setMessage(
          error.message?.includes('disabled')
            ? 'El acceso biométrico aún no está activado en el servidor. Usa tu correo y contraseña.'
            : 'No se pudo entrar con biométrico. Usa tu correo y contraseña, o actívalo primero desde ahí.'
        );
        return;
      }
      window.location.href = '/play';
    } catch (err: any) {
      setPasskeyLoading(false);
      setMessage('Tu navegador o dispositivo no completó el biométrico. Usa tu correo y contraseña.');
    }
  }

  async function activatePasskeyNow() {
    setPasskeyOfferBusy(true);
    try {
      const { error } = await supabaseAuth.registerPasskey();
      if (error) {
        setMessage('No se pudo activar el biométrico en este dispositivo. Puedes intentarlo después desde tu perfil.');
      }
    } catch {
      setMessage('No se pudo activar el biométrico en este dispositivo. Puedes intentarlo después desde tu perfil.');
    }
    setPasskeyOfferBusy(false);
    window.location.href = '/play';
  }

  if (passkeyOffer) {
    return (
      <main className="login2-wrap">
        <div className="login2-mobile-brand">
          <Image src="/logo-negro.png" alt="ProKicks" width={140} height={48} priority />
        </div>
        <div className="login2-card">
          <div className="login2-card-head"><h2>¡Ya entraste!</h2></div>
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
            Activa acceso con huella o rostro para entrar en 1 segundo la próxima vez, sin escribir tu contraseña.
          </p>
          {message && <div className="login2-msg">{message}</div>}
          <button className="login2-btn login2-btn-signin" onClick={activatePasskeyNow} disabled={passkeyOfferBusy} style={{ marginBottom: 8 }}>
            {passkeyOfferBusy ? 'Activando...' : 'Activar ahora'}
          </button>
          <button className="login2-btn" style={{ background: '#E2E8F0', color: '#334155' }} onClick={() => { window.location.href = '/play'; }}>
            Ahora no
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="login2-wrap">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div className="login2-mobile-brand">
        <Image src="/logo-negro.png" alt="ProKicks" width={56} height={56} style={{ objectFit: 'contain' }} priority />
        <h1>ProKicks Play</h1>
        <p>Entrena. Compite. Domina.</p>
      </div>

      <div className="login2-shell">
        <div className="login2-brand-panel">
          <Image src="/logo-blanco.png" alt="ProKicks" width={220} height={220} style={{ objectFit: 'contain' }} priority />
          <h1 className="login2-brand-title">ProKicks Play</h1>
          <p className="login2-brand-sub">Entrena. Compite. Domina.</p>
        </div>

        <div className="login2-forms-col">
          <div className="login2-cards-row">

            <div className="login2-card">
              <div className="login2-card-head">
                <span className="login2-dot" style={{ background: '#173B63' }} />
                <h2>Ya tienes cuenta</h2>
                <span className="login2-tag">INGRESA</span>
              </div>

              <div className="login2-oauth-row">
                <button type="button" className="login2-oauth-btn" onClick={withGoogle}><GoogleIcon /> Google</button>
              </div>

              <div className="login2-divider"><span>o con tu correo</span></div>

              <div className="login2-field"><input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="login2-field"><input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} /></div>

              <div className="login2-row-between">
                <button
                  type="button"
                  className="login2-biometric-chip"
                  onClick={loginWithPasskey}
                  disabled={passkeyLoading || !canPasskey}
                >
                  <FaceIdIcon /> {passkeyLoading ? 'Verificando...' : 'Usar huella / rostro'}
                </button>
                <Link className="login2-forgot" href="/recuperar">¿Olvidaste tu contraseña?</Link>
              </div>

              {message && <div className="login2-msg">{message}</div>}

              <button className="login2-btn login2-btn-signin" onClick={submitLogin} disabled={loading || !email || !password}>
                {loading ? 'Entrando...' : 'Entrar a la cancha'}
              </button>
            </div>

            <div className="login2-card">
              <div className="login2-card-head">
                <span className="login2-dot" style={{ background: '#EA580C' }} />
                <h2>¿Nuevo? Crea tu cuenta</h2>
                <span className="login2-tag">REGISTRO</span>
              </div>

              <div className="login2-oauth-row">
                <button type="button" className="login2-oauth-btn" onClick={withGoogle}><GoogleIcon /> Google</button>
              </div>

              <div className="login2-divider"><span>o con tu correo</span></div>

              <div className="login2-field"><input placeholder="Nickname" value={suNickname} onChange={(e) => setSuNickname(e.target.value)} /></div>
              <div className="login2-field"><input type="email" placeholder="tu@email.com" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} /></div>
              <div className="login2-field" style={{ marginBottom: 14 }}><input type="password" placeholder="Crea una contraseña" value={suPassword} onChange={(e) => setSuPassword(e.target.value)} /></div>

              {suMessage && <div className="login2-msg">{suMessage}</div>}

              <button className="login2-btn login2-btn-signup" onClick={submitSignup} disabled={suLoading}>
                {suLoading ? 'Creando...' : 'Crear mi cuenta'}
              </button>
            </div>

          </div>

          <div className="login2-turnstile">
            <div id="turnstile-container" />
            <div className="auth-turnstile-note">Protegido por Cloudflare</div>
          </div>

          <Link className="login2-admin-card" href="/admin/login">
            <span className="login2-admin-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" /></svg>
            </span>
            <div>
              <h3>Acceso administrador</h3>
              <p>Panel de control ProKicks</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
