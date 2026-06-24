'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { SupabaseNotice } from '@/components/SupabaseNotice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState('');

  async function submit() {
    setMessage('');
    const res = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (res.error) setMessage(res.error.message);
    else window.location.href = mode === 'signup' ? '/onboarding' : '/';
  }

  return (
    <main className="app-shell">
      <div className="topbar"><Image src="/logo-negro.png" alt="ProKicks" width={150} height={48} className="logo" /></div>
      <SupabaseNotice />
      <section className="hero section">
        <div className="kicker">Acceso</div>
        <h1 className="h1">Entra a jugar</h1>
        <p className="p">Login real con Supabase Auth.</p>
      </section>
      <section className="card section form">
        <input className="input" placeholder="Correo" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="input" placeholder="Contraseña" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        {message && <div className="alert error">{message}</div>}
        <button className="btn btn-primary btn-full" onClick={submit}>{mode === 'login' ? 'Entrar' : 'Crear cuenta'}</button>
        <button className="btn btn-soft btn-full" onClick={()=>setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Crear cuenta nueva' : 'Ya tengo cuenta'}
        </button>
      </section>
      <Link className="tag" href="/">Volver al inicio</Link>
    </main>
  );
}
