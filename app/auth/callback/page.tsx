'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage(){
  const [message,setMessage]=useState('Confirmando correo...');
  useEffect(()=>{
    supabase.auth.getSession().then(({ data })=>{
      setMessage(data.session ? 'Correo confirmado. Ya puedes continuar.' : 'Correo procesado. Inicia sesión para continuar.');
    });
  },[]);
  return <main className="register-screen">
    <section className="register-card auth-card"><h1>{message}</h1><Link className="btn btn-primary" href="/login">Ir a iniciar sesión</Link></section>
  </main>
}
