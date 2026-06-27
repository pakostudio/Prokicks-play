'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { AppShell } from '@/components/AppShell';

export default function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [nextPath, setNextPath] = useState('/admin');

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('next') || '/admin';
    setNextPath(value.startsWith('/admin') ? value : '/admin');
  }, []);

  async function submit() {
    setLoading(true);
    setMessage('');

    const response = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setMessage(result.error || 'No se pudo iniciar sesión.');
      setLoading(false);
      return;
    }

    router.replace(nextPath);
  }

  return (
    <AppShell active="perfil">
      <section className="hero section">
        <div className="kicker">Admin seguro</div>
        <h1 className="h1">Acceso operativo</h1>
        <p className="p">Ingresa el código interno para abrir el panel ProKicks.</p>
      </section>

      <section className="card form section">
        <div className="card-head">
          <Lock color="#173B63" />
          <div>
            <h2>Verificación admin</h2>
            <p>Sesión privada por 12 horas.</p>
          </div>
        </div>
        <input
          className="input"
          type="password"
          placeholder="Código admin"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit();
          }}
        />
        <button className="btn btn-primary btn-full" disabled={loading || !passcode.trim()} onClick={submit}>
          {loading ? 'Validando...' : 'Entrar'}
        </button>
        {message && <p className="p">{message}</p>}
      </section>
    </AppShell>
  );
}
