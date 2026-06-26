'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage(){
  const [password,setPassword]=useState('');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  async function submit(){
    setLoading(true); setMessage('');
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    setMessage(error ? error.message : 'Contraseña actualizada. Ya puedes iniciar sesión.');
  }
  return <main className="register-screen">
    <section className="register-title"><span>ProKicks Play</span><h1>Nueva contraseña</h1><p>Define una contraseña de mínimo 8 caracteres.</p></section>
    <section className="register-card">
      <input type="password" placeholder="Nueva contraseña" value={password} onChange={(e)=>setPassword(e.target.value)} />
      {message && <div className="alert ok">{message}</div>}
      <button className="btn btn-primary" disabled={password.length<8 || loading} onClick={submit}>{loading?'Guardando...':'Actualizar contraseña'}</button>
      <Link className="btn btn-soft" href="/login">Ir a iniciar sesión</Link>
    </section>
  </main>
}
