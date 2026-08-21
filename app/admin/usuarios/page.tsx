'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { supabase } from '@/lib/supabase';
import { avatarOptions } from '@/lib/demo';
import { formatDateTimeEs } from '@/lib/format';

type Profile = {
  id?: string;
  name?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  nickname?: string | null;
  avatar_id?: string | null;
  avatar_name?: string | null;
  avatar_image?: string | null;
  created_at?: string | null;
};

export default function AdminUsuarios(){
  const [rows,setRows]=useState<Profile[]>([]);
  const [msg,setMsg]=useState('');
  const [editingId,setEditingId]=useState<string | null>(null);
  const [editForm,setEditForm]=useState<Profile>({});
  const [saving,setSaving]=useState(false);

  async function load(){
    const { data, error } = await supabase.from('prokicks_profiles').select('id,name,email,whatsapp,nickname,avatar_id,avatar_name,avatar_image,created_at').order('created_at', { ascending:false }).limit(50);
    const localRaw = window.localStorage.getItem('prokicks_profile');
    const local = localRaw ? JSON.parse(localRaw) : null;
    if (error) setMsg('Perfiles en Supabase pendientes de SQL/policies. Mostrando perfil local de presentación si existe.');
    setRows([...(local ? [local] : []), ...((data || []) as Profile[])]);
  }

  useEffect(()=>{ load(); },[]);

  function startEdit(row: Profile){
    setEditingId(row.id || null);
    setEditForm({ ...row });
    setMsg('');
  }

  function cancelEdit(){
    setEditingId(null);
    setEditForm({});
  }

  function updateField(key: keyof Profile, value: string){
    setEditForm((prev)=> ({ ...prev, [key]: value }));
  }

  function pickAvatar(option: { id: string; name: string; image: string }){
    setEditForm((prev)=> ({ ...prev, avatar_id: option.id, avatar_name: option.name, avatar_image: null }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditForm((prev)=> ({ ...prev, avatar_image: String(reader.result), avatar_name: 'Foto de perfil' }));
    };
    reader.readAsDataURL(file);
  }

  async function saveEdit(){
    if (!editingId) return;
    setSaving(true);
    const { error } = await supabase.from('prokicks_profiles').update({
      name: editForm.name || null,
      email: editForm.email || null,
      whatsapp: editForm.whatsapp || null,
      nickname: editForm.nickname || null,
      avatar_id: editForm.avatar_id || null,
      avatar_name: editForm.avatar_name || null,
      avatar_image: editForm.avatar_image || null,
    }).eq('id', editingId);
    setSaving(false);
    if (error) {
      setMsg('No pudimos guardar los cambios: ' + error.message);
      return;
    }
    setMsg('Perfil actualizado.');
    setEditingId(null);
    setEditForm({});
    await load();
  }

  async function exportExcel(){
    const XLSX = await import('xlsx');
    const data = rows.map((row)=> ({
      Nombre: row.name || '',
      Email: row.email || '',
      WhatsApp: row.whatsapp || '',
      Nickname: row.nickname || '',
      Avatar: row.avatar_name || row.avatar_id || '',
      Registrado: row.created_at ? formatDateTimeEs(row.created_at) : '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    XLSX.writeFile(wb, `prokicks-usuarios-${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  return <AdminShell active="usuarios">
    <section className="hero section"><div className="kicker">Admin</div><h1 className="h1">Usuarios / perfiles</h1><p className="p">Nombre, email, WhatsApp, nickname, avatar y fecha de registro.</p></section>
    <section className="card form section">
      <div className="row"><strong>{rows.length} perfiles</strong><div style={{ display:'flex', gap:8 }}><button className="btn btn-soft" onClick={exportExcel}>Exportar Excel</button><button className="btn btn-soft" onClick={load}>Actualizar</button></div></div>
      {msg && <div className="alert warn">{msg}</div>}
      <div className="table-wrap"><table className="admin-table"><thead><tr><th>Nombre</th><th>Contacto</th><th>Nickname</th><th>Avatar</th><th>Acciones</th></tr></thead><tbody>
        {rows.map((row, index)=>{
          const avatar = avatarOptions.find((item) => item.id === row.avatar_id);
          const image = row.avatar_image || avatar?.image;
          const rowKey = row.id || `${row.email}-${index}`;
          const isEditing = editingId && row.id === editingId;

          if (isEditing) {
            const editImage = editForm.avatar_image || avatarOptions.find((item) => item.id === editForm.avatar_id)?.image;
            return <tr key={rowKey}>
              <td colSpan={5}>
                <div className="card form section" style={{ margin: 0 }}>
                  <label>Nombre completo
                    <input className="input" value={editForm.name || ''} onChange={(e)=>updateField('name', e.target.value)} />
                  </label>
                  <label>Email
                    <input className="input" value={editForm.email || ''} onChange={(e)=>updateField('email', e.target.value)} />
                  </label>
                  <label>WhatsApp
                    <input className="input" value={editForm.whatsapp || ''} onChange={(e)=>updateField('whatsapp', e.target.value)} />
                  </label>
                  <label>Nickname
                    <input className="input" value={editForm.nickname || ''} onChange={(e)=>updateField('nickname', e.target.value)} />
                  </label>

                  <div className="row" style={{ alignItems:'center', gap: 12 }}>
                    {editImage && <img className="admin-avatar-img" src={editImage} alt="Avatar actual" style={{ width: 56, height: 56, borderRadius: '50%' }} />}
                    <label className="btn btn-soft" style={{ cursor: 'pointer' }}>
                      Subir foto
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                    </label>
                  </div>

                  <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
                    {avatarOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className="btn btn-soft"
                        onClick={() => pickAvatar(option)}
                        style={{ padding: 4, border: editForm.avatar_id === option.id && !editForm.avatar_image ? '2px solid var(--accent, #173B63)' : undefined }}
                      >
                        <img src={option.image} alt={option.name} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                      </button>
                    ))}
                  </div>

                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn btn-primary" disabled={saving} onClick={saveEdit}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
                    <button className="btn btn-soft" disabled={saving} onClick={cancelEdit}>Cancelar</button>
                  </div>
                </div>
              </td>
            </tr>;
          }

          return <tr key={rowKey}><td>{row.name || '-'}</td><td>{row.email || '-'}<br/><small>{row.whatsapp || ''}</small></td><td>{row.nickname || '-'}</td><td>{image && <img className="admin-avatar-img" src={image} alt={row.avatar_name || row.avatar_id || 'Avatar'} />}{row.avatar_name || row.avatar_id || '-'}</td><td>{row.id && <button className="btn btn-soft" onClick={() => startEdit(row)}>Editar</button>}</td></tr>
        })}
      </tbody></table></div>
      {!rows.length && <p className="p">Aún no hay perfiles.</p>}
    </section>
  </AdminShell>
}
