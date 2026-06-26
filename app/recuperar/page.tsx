'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RecoverPage(){
  const [email,setEmail]=useState('');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  async function submit(){
    setLoading(true); setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://prokicks-play.vercel.app/reset-password' });
    setLoading(false);
    setMessage(error ? error.message : 'Te enviamos un correo para crear una nueva contraseña.');
  }
  return <main className="register-screen">
    <header className="register-header"><Link href="/login" className="back-link"><ChevronLeft size={18}/> Volver</Link></header>
    <section className="register-title"><span>Acceso ProKicks</span><h1>Recuperar contraseña</h1><p>Ingresa el correo de tu cuenta.</p></section>
    <section className="register-card">
      <div className="card-head"><Mail/><div><h2>Correo electrónico</h2><p>Recibirás un enlace seguro para restablecer tu contraseña.</p></div></div>
      <input type="email" placeholder="correo@dominio.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
      {message && <div className="alert ok">{message}</div>}
      <button className="btn btn-primary" disabled={!email || loading} onClick={submit}>{loading?'Enviando...':'Enviar enlace'}</button>
    </section>
  </main>
}
