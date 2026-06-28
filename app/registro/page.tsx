'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { avatarOptions } from '@/lib/demo';
import { supabase } from '@/lib/supabase';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    nickname: '',
    avatarId: avatarOptions[0].id,
    password: '',
    accepted: false,
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedAvatar = avatarOptions.find((avatar) => avatar.id === form.avatarId) || avatarOptions[0];
  const canSubmit =
    form.name.trim().length >= 3 &&
    emailPattern.test(form.email.trim()) &&
    digitsOnly(form.whatsapp).length >= 10 &&
    form.nickname.trim().length >= 3 &&
    form.password.length >= 6 &&
    form.accepted;

  function update(key: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function sendProfileEmail() {
    await fetch('/api/profile-registration-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim(),
        nickname: form.nickname.trim(),
        avatarName: selectedAvatar.name,
      }),
    }).catch(() => null);
  }

  async function submit() {
    setMessage('');
    if (!canSubmit) {
      setMessage('Completa nombre, email, WhatsApp, nickname, contraseña y aceptación para crear tu perfil.');
      return;
    }

    setLoading(true);
    const profile = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      whatsapp: form.whatsapp.trim(),
      nickname: form.nickname.trim(),
      avatar_id: selectedAvatar.id,
      avatar_name: selectedAvatar.name,
      avatar_image: selectedAvatar.image,
    };

    let { error } = await supabase.from('prokicks_profiles').insert(profile);
    if (error && String(error.message || '').includes('avatar_image')) {
      const { avatar_image, ...profileWithoutImage } = profile;
      const retry = await supabase.from('prokicks_profiles').insert(profileWithoutImage);
      error = retry.error;
    }
    window.localStorage.setItem('prokicks_profile', JSON.stringify({ ...profile, created_at: new Date().toISOString() }));
    await sendProfileEmail();
    setLoading(false);

    if (error) {
      setMessage('Perfil ProKicks creado para esta demo. Ejecuta el SQL del sprint para verlo también en admin/Supabase.');
      return;
    }

    setMessage('Perfil ProKicks creado. Ya puedes conectar un spot y crear una reta.');
  }

  return (
    <main className="register-screen">
      <header className="register-header">
        <Link href="/play" className="back-link"><ChevronLeft size={18} /> Volver</Link>
        <Image src="/logo-negro.png" alt="ProKicks" width={120} height={40} className="logo" />
      </header>

      <section className="register-title">
        <span>Perfil ProKicks</span>
        <h1>Crea tu perfil</h1>
        <p>Registro básico para presentación: nickname, avatar y contacto.</p>
      </section>

      <section className="register-card">
        <div className="card-head"><UserRound /><div><h2>Datos del jugador</h2><p>Con esto puedes continuar el recorrido principal.</p></div></div>
        <input placeholder="Nombre completo" value={form.name} onChange={(e) => update('name', e.target.value)} />
        <label className="field-label"><Mail size={16} /> Email</label>
        <input type="email" placeholder="tu@email.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <label className="field-label"><Phone size={16} /> WhatsApp</label>
        <input inputMode="tel" placeholder="+52 56 2449 2892" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
        <input placeholder="Nickname" value={form.nickname} onChange={(e) => update('nickname', e.target.value)} />

        <div className="avatar-section">
          <h2 className="card-title">Elige tu avatar</h2>
          <div className="avatar-grid">
            {avatarOptions.map((avatar) => (
              <button
                type="button"
                key={avatar.id}
                className={`avatar-choice ${form.avatarId === avatar.id ? 'selected' : ''}`}
                onClick={() => update('avatarId', avatar.id)}
              >
                <img src={avatar.image} alt={avatar.name} />
                <strong>{avatar.name}</strong>
              </button>
            ))}
          </div>
        </div>

        <label className="field-label">Contraseña</label>
        <input type="password" placeholder="Contraseña" value={form.password} onChange={(e) => update('password', e.target.value)} />
        <p className="legal-note">Crea una contraseña para entrar después a tu perfil. Login con Google/Apple próximamente.</p>

        <label className="check"><input type="checkbox" checked={form.accepted} onChange={(e) => update('accepted', e.target.checked)} /> Acepto el reglamento, privacidad y uso de imagen ProKicks.</label>
        <div className="card">
          <img className="avatar-preview" src={selectedAvatar.image} alt={selectedAvatar.name} />
          <h3 className="card-title">{form.nickname || 'Tu nickname'}</h3>
          <p className="p">{selectedAvatar.name}</p>
        </div>
        {message && <div className={message.includes('creado') ? 'alert ok' : 'alert warn'}>{message}</div>}
        {message && <div className="grid section">
          <Link className="btn btn-primary" href="/scan">Conectar spot</Link>
          <Link className="btn btn-warm" href="/torneos">Ver torneo Indoor</Link>
          <Link className="btn btn-soft" href="/perfil">Ver perfil</Link>
        </div>}
        <button className="btn btn-primary btn-full" onClick={submit} disabled={loading || !canSubmit}>{loading ? 'Creando...' : 'Crear perfil ProKicks'}</button>
        {!canSubmit && <p className="helper-text">Completa todos los campos para continuar.</p>}
      </section>
    </main>
  );
}
