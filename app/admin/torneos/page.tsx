'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Plus, Save, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

type Tournament = {
  id?: string;
  title: string;
  description: string;
  city: string;
  state: string;
  format: '1v1'|'2v2'|'3v3'|'mixto';
  level: 'principiante'|'intermedio'|'avanzado'|'abierto';
  status: 'draft'|'open'|'full'|'in_progress'|'finished'|'cancelled';
  starts_at: string;
  ends_at: string;
  capacity: number;
  is_free: boolean;
  cost: number;
  currency: string;
  payment_method: string;
  payment_url: string;
  rules: string;
};

const empty:Tournament = {
  title:'', description:'', city:'CDMX', state:'Ciudad de México', format:'1v1', level:'abierto', status:'open',
  starts_at:'', ends_at:'', capacity:32, is_free:true, cost:0, currency:'MXN', payment_method:'pendiente_configurar', payment_url:'',
  rules:'Registro sujeto a disponibilidad. El participante debe aceptar reglamento y autorización de uso de imagen.'
};

function toInputDate(value?:string){
  if(!value) return '';
  const d = new Date(value);
  if(Number.isNaN(d.getTime())) return '';
  const pad = (n:number)=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function money(value:number, currency = 'MXN'){
  if(!value) return 'Sin costo';
  return new Intl.NumberFormat('es-MX', { style:'currency', currency }).format(value);
}

export default function AdminTorneosPage(){
  const [items,setItems]=useState<Tournament[]>([]);
  const [form,setForm]=useState<Tournament>(empty);
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState('');
  const editing = Boolean(form.id);
  const sorted = useMemo(()=>items.slice().sort((a,b)=>String(a.starts_at||'').localeCompare(String(b.starts_at||''))),[items]);

  async function load(){
    setLoading(true);
    const { data, error } = await supabase.from('prokicks_tournaments').select('*').order('starts_at', { ascending:true });
    if(error) setMsg(error.message);
    setItems((data || []) as Tournament[]);
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  function update<K extends keyof Tournament>(key:K, value:Tournament[K]){ setForm(prev=>({...prev,[key]:value})); }

  async function save(){
    if(!form.title.trim()){ setMsg('Falta nombre del torneo.'); return; }
    setMsg('Guardando...');
    const finalCost = form.is_free ? 0 : Number(form.cost || 0);
    const payload = {
      title: form.title,
      description: form.description,
      city: form.city,
      state: form.state,
      format: form.format,
      level: form.level,
      status: form.status,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      capacity: Number(form.capacity || 0),
      is_free: form.is_free,
      cost: finalCost,
      currency: form.currency || 'MXN',
      payment_method: form.is_free ? 'sin_costo' : (form.payment_method || 'pendiente_configurar'),
      payment_url: form.payment_url || null,
      rules: form.rules,
      updated_at: new Date().toISOString()
    };
    const result = editing
      ? await supabase.from('prokicks_tournaments').update(payload).eq('id', form.id)
      : await supabase.from('prokicks_tournaments').insert(payload);
    if(result.error){ setMsg(result.error.message); return; }
    setMsg(editing ? 'Torneo actualizado.' : 'Torneo creado.');
    setForm(empty);
    load();
  }

  async function remove(id?:string){
    if(!id) return;
    const ok = window.confirm('¿Eliminar este torneo?');
    if(!ok) return;
    const { error } = await supabase.from('prokicks_tournaments').delete().eq('id', id);
    if(error){ setMsg(error.message); return; }
    setMsg('Torneo eliminado.');
    setForm(empty);
    load();
  }

  return <AppShell active="perfil">
    <section className="hero section"><div className="kicker">Admin · Torneos</div><h1 className="h1">Crear y editar torneos</h1><p className="p">Configura sede, cupo, costo y base futura para pagos.</p></section>

    <section className="grid-2 section">
      <div className="card form">
        <div className="row"><h2 className="card-title">{editing ? 'Editar torneo' : 'Nuevo torneo'}</h2><button className="btn btn-soft" onClick={()=>setForm(empty)}><Plus size={16}/> Nuevo</button></div>
        <input className="input" placeholder="Nombre del torneo" value={form.title} onChange={e=>update('title', e.target.value)} />
        <textarea className="input textarea" placeholder="Descripción" value={form.description} onChange={e=>update('description', e.target.value)} />
        <div className="grid-2 tight">
          <input className="input" placeholder="Ciudad" value={form.city} onChange={e=>update('city', e.target.value)} />
          <input className="input" placeholder="Estado" value={form.state} onChange={e=>update('state', e.target.value)} />
        </div>
        <div className="grid-2 tight">
          <select className="input" value={form.format} onChange={e=>update('format', e.target.value as Tournament['format'])}><option value="1v1">1v1</option><option value="2v2">2v2</option><option value="3v3">3v3 futuro</option><option value="mixto">Mixto</option></select>
          <select className="input" value={form.level} onChange={e=>update('level', e.target.value as Tournament['level'])}><option value="principiante">Principiante</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option><option value="abierto">Abierto</option></select>
        </div>
        <div className="grid-2 tight">
          <select className="input" value={form.status} onChange={e=>update('status', e.target.value as Tournament['status'])}><option value="draft">Borrador</option><option value="open">Abierto</option><option value="full">Lleno</option><option value="in_progress">En curso</option><option value="finished">Finalizado</option><option value="cancelled">Cancelado</option></select>
          <input className="input" type="number" min="1" placeholder="Cupo" value={form.capacity} onChange={e=>update('capacity', Number(e.target.value))} />
        </div>
        <div className="grid-2 tight">
          <input className="input" type="datetime-local" value={toInputDate(form.starts_at)} onChange={e=>update('starts_at', e.target.value)} />
          <input className="input" type="datetime-local" value={toInputDate(form.ends_at)} onChange={e=>update('ends_at', e.target.value)} />
        </div>

        <div className="payment-box">
          <label className="check-row">
            <input type="checkbox" checked={form.is_free} onChange={e=>update('is_free', e.target.checked)} />
            <span>Torneo sin costo</span>
          </label>
          {!form.is_free && <div className="grid-2 tight">
            <input className="input" type="number" min="0" placeholder="Costo" value={form.cost} onChange={e=>update('cost', Number(e.target.value))} />
            <select className="input" value={form.currency} onChange={e=>update('currency', e.target.value)}><option value="MXN">MXN</option><option value="USD">USD</option></select>
            <select className="input" value={form.payment_method} onChange={e=>update('payment_method', e.target.value)}><option value="pendiente_configurar">Pago futuro / pendiente</option><option value="mercado_pago">Mercado Pago futuro</option><option value="stripe">Stripe futuro</option><option value="transferencia">Transferencia</option><option value="whatsapp">Confirmar por WhatsApp</option></select>
            <input className="input" placeholder="URL de pago futura opcional" value={form.payment_url} onChange={e=>update('payment_url', e.target.value)} />
          </div>}
        </div>

        <textarea className="input textarea" placeholder="Reglas" value={form.rules} onChange={e=>update('rules', e.target.value)} />
        <div className="row"><span className="tag tag-blue">{form.is_free ? 'Registro sin costo' : money(Number(form.cost || 0), form.currency)}</span><button className="btn btn-primary" onClick={save}><Save size={16}/> Guardar</button></div>
        {editing && <button className="btn btn-soft btn-full" onClick={()=>remove(form.id)}><Trash2 size={16}/> Eliminar torneo</button>}
        {msg && <p className="p">{msg}</p>}
      </div>

      <div className="card form">
        <div className="row"><h2 className="card-title">Torneos existentes</h2><button className="btn btn-soft" onClick={load}>{loading?'Cargando...':'Actualizar'}</button></div>
        <div className="list compact-list">
          {sorted.map(t=><button key={t.id} className="admin-row" onClick={()=>setForm({...empty, ...t, starts_at:t.starts_at || '', ends_at:t.ends_at || '', cost:Number(t.cost || 0), currency:t.currency || 'MXN', payment_method:t.payment_method || 'pendiente_configurar', payment_url:t.payment_url || ''})}>
            <strong>{t.title}</strong><span>{t.format} · {t.level} · {t.status}</span><small><CalendarDays size={13}/>{t.starts_at ? new Date(t.starts_at).toLocaleString('es-MX') : 'Sin fecha'} · {t.is_free === false ? money(Number(t.cost || 0), t.currency || 'MXN') : 'Sin costo'}</small>
          </button>)}
          {!sorted.length && <p className="p">No hay torneos todavía.</p>}
        </div>
        <Link className="btn btn-soft btn-full" href="/admin/registros-torneos">Ver registros de participantes</Link>
      </div>
    </section>
  </AppShell>
}
