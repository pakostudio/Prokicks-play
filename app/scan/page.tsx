'use client';
import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

export default function ScanPage(){
  const [code,setCode]=useState('PK-ROMA-001');
  const [msg,setMsg]=useState('');
  async function lookup(){
    setMsg('');
    const { data, error } = await supabase.from('prokicks_devices').select('*, prokicks_spots(*)').eq('qr_code', code).maybeSingle();
    if(error || !data){ setMsg('QR no encontrado. Usa datos demo o carga seed.sql.'); return; }
    window.location.href = `/spots/${data.spot_id}`;
  }
  return <AppShell active="scan">
    <section className="hero section"><div className="kicker">QR</div><h1 className="h1">Escanea dispositivo</h1><p className="p">Por ahora usamos ingreso manual de código. Cámara va en siguiente iteración.</p></section>
    <section className="qr-box section"><div><strong>QR ProKicks</strong><p className="p">Código demo: PK-ROMA-001</p></div></section>
    <section className="card form section">
      <input className="input" value={code} onChange={e=>setCode(e.target.value)} placeholder="Código QR" />
      {msg && <div className="alert error">{msg}</div>}
      <button className="btn btn-primary" onClick={lookup}>Detectar spot</button>
    </section>
  </AppShell>
}
