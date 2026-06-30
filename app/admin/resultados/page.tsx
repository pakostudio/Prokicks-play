'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/monitoring';

type Tournament = { id: string; title: string };
type Result = {
  id?: string;
  tournament_id: string;
  position: number;
  participant_name: string;
  team_name: string;
  category: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
  status: string;
  notes: string;
  published: boolean;
};

function emptyResult(tournament_id = ''): Result {
  return { tournament_id, position: 1, participant_name: '', team_name: '', category: 'libre', played: 0, wins: 0, losses: 0, points: 0, status: 'participante', notes: '', published: false };
}

export default function AdminResultadosPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [items, setItems] = useState<Result[]>([]);
  const [form, setForm] = useState<Result>(emptyResult());
  const [selectedTournament, setSelectedTournament] = useState('');
  const [msg, setMsg] = useState('');
  const editing = Boolean(form.id);
  const sorted = useMemo(() => items.slice().sort((a, b) => a.position - b.position), [items]);

  async function load(tournamentId = selectedTournament) {
    const tournamentResult = await supabase.from('prokicks_tournaments').select('id,title').order('starts_at', { ascending: true });
    setTournaments((tournamentResult.data || []) as Tournament[]);
    const nextTournamentId = tournamentId || tournamentResult.data?.[0]?.id || '';
    if (!selectedTournament && nextTournamentId) setSelectedTournament(nextTournamentId);
    if (!nextTournamentId) return;
    const { data, error } = await supabase.from('prokicks_tournament_results').select('*').eq('tournament_id', nextTournamentId).order('position', { ascending: true });
    if (error) {
      captureError(error, { area: 'admin-results-select' });
      setMsg(error.message);
    }
    setItems((data || []) as Result[]);
  }

  useEffect(() => { load(); }, []);

  function update<K extends keyof Result>(key: K, value: Result[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!selectedTournament || !form.participant_name.trim()) {
      setMsg('Selecciona torneo y captura participante.');
      return;
    }
    setMsg('Guardando...');
    const { id: _id, ...cleanForm } = form;
    const payload = { ...cleanForm, tournament_id: selectedTournament, updated_at: new Date().toISOString() };
    const result = editing
      ? await supabase.from('prokicks_tournament_results').update(payload).eq('id', form.id)
      : await supabase.from('prokicks_tournament_results').insert(payload);
    if (result.error) {
      captureError(result.error, { area: 'admin-results-save', editing });
      setMsg(result.error.message);
      return;
    }
    setMsg(editing ? 'Resultado actualizado.' : 'Resultado creado.');
    setForm(emptyResult(selectedTournament));
    load(selectedTournament);
  }

  async function publishAll(published: boolean) {
    if (!selectedTournament) return;
    const { error } = await supabase.from('prokicks_tournament_results').update({ published, updated_at: new Date().toISOString() }).eq('tournament_id', selectedTournament);
    if (error) setMsg(error.message);
    else {
      setMsg(published ? 'Resultados publicados.' : 'Resultados guardados como borrador.');
      load(selectedTournament);
    }
  }

  async function remove(id?: string) {
    if (!id || !window.confirm('¿Eliminar este resultado?')) return;
    const { error } = await supabase.from('prokicks_tournament_results').delete().eq('id', id);
    if (error) setMsg(error.message);
    else {
      setMsg('Resultado eliminado.');
      setForm(emptyResult(selectedTournament));
      load(selectedTournament);
    }
  }

  return (
    <AppShell active="perfil">
      <section className="hero section"><div className="kicker">Admin · Resultados</div><h1 className="h1">Resultados de torneos</h1><p className="p">Crea podio y tabla simple. Brackets quedan para después.</p></section>
      <section className="card form section">
        <select className="input" value={selectedTournament} onChange={(event) => { setSelectedTournament(event.target.value); setForm(emptyResult(event.target.value)); load(event.target.value); }}>
          {tournaments.map((tournament) => <option key={tournament.id} value={tournament.id}>{tournament.title}</option>)}
        </select>
        <div className="row"><button className="btn btn-soft" onClick={() => setForm(emptyResult(selectedTournament))}><Plus size={16} /> Agregar resultado</button><button className="btn btn-primary" onClick={() => publishAll(true)}>Publicar resultados</button><button className="btn btn-soft" onClick={() => publishAll(false)}>Guardar borrador</button></div>
        {msg && <p className="p">{msg}</p>}
      </section>
      <section className="grid-2 section">
        <div className="card form">
          <h2 className="card-title">{editing ? 'Editar resultado' : 'Nuevo resultado'}</h2>
          <div className="grid-2 tight"><input className="input" type="number" min="1" placeholder="Posición" value={form.position} onChange={(event) => update('position', Number(event.target.value))} /><select className="input" value={form.status} onChange={(event) => update('status', event.target.value)}><option value="campeon">campeon</option><option value="segundo">segundo</option><option value="tercero">tercero</option><option value="participante">participante</option><option value="eliminado">eliminado</option></select></div>
          <input className="input" placeholder="Participante" value={form.participant_name} onChange={(event) => update('participant_name', event.target.value)} />
          <input className="input" placeholder="Equipo" value={form.team_name} onChange={(event) => update('team_name', event.target.value)} />
          <input className="input" placeholder="Categoría" value={form.category} onChange={(event) => update('category', event.target.value)} />
          <div className="grid-2 tight"><input className="input" type="number" placeholder="Jugados" value={form.played} onChange={(event) => update('played', Number(event.target.value))} /><input className="input" type="number" placeholder="Puntos" value={form.points} onChange={(event) => update('points', Number(event.target.value))} /></div>
          <div className="grid-2 tight"><input className="input" type="number" placeholder="Ganados" value={form.wins} onChange={(event) => update('wins', Number(event.target.value))} /><input className="input" type="number" placeholder="Perdidos" value={form.losses} onChange={(event) => update('losses', Number(event.target.value))} /></div>
          <textarea className="input textarea" placeholder="Notas" value={form.notes} onChange={(event) => update('notes', event.target.value)} />
          <label className="check-row"><input type="checkbox" checked={form.published} onChange={(event) => update('published', event.target.checked)} /><span>Publicado</span></label>
          <button className="btn btn-primary btn-full" onClick={save}><Save size={16} /> Guardar</button>
          {editing && <button className="btn btn-soft btn-full" onClick={() => remove(form.id)}><Trash2 size={16} /> Eliminar</button>}
        </div>
        <div className="card form">
          <h2 className="card-title">Tabla editable</h2>
          <div className="list compact-list">
            {sorted.map((item) => <button className="admin-row" key={item.id} onClick={() => setForm({ ...emptyResult(selectedTournament), ...item })}><strong>#{item.position} · {item.participant_name}</strong><span>{item.category} · {item.status} · {item.published ? 'publicado' : 'borrador'}</span></button>)}
            {!sorted.length && <p className="p">No hay resultados todavía.</p>}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
