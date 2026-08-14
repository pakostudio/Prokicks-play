'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Camera, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
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
    heightCm: '',
    accepted: false,
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem('prokicks_profile');
    if (!raw) return;
    try {
      const existing = JSON.parse(raw);
      setForm((prev) => ({
        ...prev,
        name: existing.name || '',
        email: existing.email || '',
        whatsapp: existing.whatsapp || '',
        nickname: existing.nickname || '',
        avatarId: existing.avatar_id || prev.avatarId,
        heightCm: existing.height_cm ? String(existing.height_cm) : '',
      }));
      if (existing.avatar_name === 'Foto de perfil' && existing.avatar_image) {
        setPhotoDataUrl(existing.avatar_image);
      }
      setIsEditing(true);
    } catch {
      // perfil local invalido, se ignora y se deja el formulario vacio
    }
  }, []);

  const selectedAvatar = avatarOptions.find((avatar) => avatar.id === form.avatarId) || avatarOptions[0];
  const previewImage = photoDataUrl || selectedAvatar.image;
  const previewLabel = photoDataUrl ? 'Tu foto' : selectedAvatar.name;
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

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Selecciona un archivo de imagen válido.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('La foto debe pesar menos de 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.onerror = () => setPhotoError('No pudimos leer esa foto, intenta con otra.');
    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    setPhotoDataUrl(null);
    setPhotoError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        avatarName: previewLabel,
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
    const heightCmNumber = Number(form.heightCm);
    const profile = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      whatsapp: form.whatsapp.trim(),
      nickname: form.nickname.trim(),
      avatar_id: selectedAvatar.id,
      avatar_name: photoDataUrl ? 'Foto de perfil' : selectedAvatar.name,
      avatar_image: photoDataUrl || selectedAvatar.image,
      height_cm: heightCmNumber >= 120 && heightCmNumber <= 220 ? heightCmNumber : null,
    };

    let { error } = await supabase.from('prokicks_profiles').insert(profile);
    if (error && String(error.message || '').includes('avatar_image')) {
      const { avatar_image, ...profileWithoutImage } = profile;
      const retry = await supabase.from('prokicks_profiles').insert(profileWithoutImage);
      error = retry.error;
    }
    if (error && String(error.message || '').includes('height_cm')) {
      const { height_cm, ...profileWithoutHeight } = profile;
      const retry = await supabase.from('prokicks_profiles').insert(profileWithoutHeight);
      error = retry.error;
    }
    window.localStorage.setItem('prokicks_profile', JSON.stringify({ ...profile, created_at: new Date().toISOString() }));
    await sendProfileEmail();
    setLoading(false);

    if (error) {
      setMessage('Perfil ProKicks creado en este dispositivo. Revisa Supabase/policies para verlo también en admin.');
      return;
    }

    setMessage(isEditing ? 'Perfil ProKicks actualizado.' : 'Perfil ProKicks creado. Ya puedes conectar un spot y crear una reta.');
    setIsEditing(true);
  }

  return (
    <main className="register-screen">
      <header className="register-header">
        <Link href="/play" className="back-link"><ChevronLeft size={18} /> Volver</Link>
        <Image src="/logo-negro.png" alt="ProKicks" width={120} height={40} className="logo" />
      </header>

      <section className="register-title">
        <span>Perfil ProKicks</span>
        <h1>{isEditing ? 'Edita tu perfil' : 'Crea tu perfil'}</h1>
        <p>{isEditing ? 'Actualiza tus datos, nickname o avatar. Tu registro se guarda en este dispositivo.' : 'Registro básico para presentación: nickname, avatar y contacto.'}</p>
      </section>

      <section className="register-card">
        <div className="card-head"><UserRound /><div><h2>Datos del jugador</h2><p>Con esto puedes continuar el recorrido principal.</p></div></div>
        <input placeholder="Nombre completo" value={form.name} onChange={(e) => update('name', e.target.value)} />
        <label className="field-label"><Mail size={16} /> Email</label>
        <input type="email" placeholder="tu@email.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <label className="field-label"><Phone size={16} /> WhatsApp</label>
        <input inputMode="tel" placeholder="+52 56 2449 2892" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
        <input placeholder="Nickname" value={form.nickname} onChange={(e) => update('nickname', e.target.value)} />

        <label className="field-label">Estatura (cm) · opcional</label>
        <input inputMode="numeric" placeholder="Ej. 172" value={form.heightCm} onChange={(e) => update('heightCm', e.target.value)} />
        <p className="legal-note">La usamos para calibrar tus mediciones ProX con la cámara. Puedes dejarlo en blanco y agregarlo después.</p>

        <div className="avatar-section">
          <h2 className="card-title">Foto de perfil</h2>
          <p className="p" style={{ marginTop: 0 }}>Usa una foto real tuya o elige un avatar.</p>

          {photoDataUrl ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <img className="avatar-preview" src={photoDataUrl} alt="Tu foto" />
              <button type="button" className="btn btn-soft btn-full" onClick={clearPhoto}>Quitar foto y usar avatar</button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-soft btn-full"
              onClick={() => fileInputRef.current?.click()}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Camera size={18} /> Tomar o subir foto real
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
          {photoError && <div className="alert error">{photoError}</div>}

          {!photoDataUrl && (
            <>
              <h2 className="card-title" style={{ marginTop: 16 }}>O elige tu avatar</h2>
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
            </>
          )}
        </div>

        <label className="field-label">Contraseña</label>
        <input type="password" placeholder={isEditing ? 'Vuelve a escribir tu contraseña para guardar' : 'Contraseña'} value={form.password} onChange={(e) => update('password', e.target.value)} />
        <p className="legal-note">Crea una contraseña para entrar después a tu perfil. Login con Google/Apple próximamente.</p>

        <label className="check"><input type="checkbox" checked={form.accepted} onChange={(e) => update('accepted', e.target.checked)} /> Acepto el reglamento, privacidad y uso de imagen ProKicks.</label>
        <div className="card">
          <img className="avatar-preview" src={previewImage} alt={previewLabel} />
          <h3 className="card-title">{form.nickname || 'Tu nickname'}</h3>
          <p className="p">{previewLabel}</p>
        </div>
        {message && <div className={message.includes('creado') || message.includes('actualizado') ? 'alert ok' : 'alert warn'}>{message}</div>}
        {message && <div className="grid section">
          <Link className="btn btn-primary" href="/scan">Conectar spot</Link>
          <Link className="btn btn-warm" href="/torneos">Ver torneo Indoor</Link>
          <Link className="btn btn-soft" href="/perfil">Ver perfil</Link>
        </div>}
        <button className="btn btn-primary btn-full" onClick={submit} disabled={loading || !canSubmit}>{loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear perfil ProKicks'}</button>
        {!canSubmit && <p className="helper-text">Completa todos los campos para continuar.</p>}
      </section>
    </main>
  );
}
