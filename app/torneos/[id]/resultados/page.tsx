'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Share2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/monitoring';
import { PROKICKS_PUBLIC_URL } from '@/lib/media';

type Result = {
  id: string;
  tournament_id: string;
  position: number;
  participant_name: string;
  team_name?: string | null;
  category?: string | null;
  played?: number | null;
  wins?: number | null;
  losses?: number | null;
  points?: number | null;
  status?: string | null;
  notes?: string | null;
  published?: boolean | null;
};

type Tournament = { id: string; title: string };

function medal(position: number) {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉';
  return String(position);
}

export default function TournamentResultsPage() {
  const params = useParams<{ id: string }>();
  const tournamentId = params.id;
  const [rows, setRows] = useState<Result[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      const [resultRows, tournamentRow] = await Promise.all([
        supabase.from('prokicks_tournament_results').select('*').eq('tournament_id', tournamentId).eq('published', true).order('position', { ascending: true }),
        supabase.from('prokicks_tournaments').select('id,title').eq('id', tournamentId).maybeSingle(),
      ]);
      if (resultRows.error) {
        captureError(resultRows.error, { area: 'results-public-detail', tournamentId });
        setMsg('Resultados en preparación.');
      }
      setRows((resultRows.data || []) as Result[]);
      if (tournamentRow.data) setTournament(tournamentRow.data as Tournament);
    }
    load();
  }, [tournamentId]);

  async function share() {
    const url = `${PROKICKS_PUBLIC_URL}/torneos/${tournamentId}/resultados`;
    if (navigator.share) await navigator.share({ title: `Resultados ${tournament?.title || 'ProKicks'}`, url });
    else await navigator.clipboard.writeText(url);
  }

  const podium = rows.filter((row) => row.position <= 3);

  return (
    <AppShell active="torneos">
      <section className="hero section"><div className="kicker">Resultados</div><h1 className="h1">{tournament?.title || 'Torneo ProKicks'}</h1><p className="p">Podio y tabla oficial publicada.</p><button className="btn btn-soft btn-full section" onClick={share}><Share2 size={16} /> Compartir resultados</button></section>
      {msg && <div className="alert warn section">{msg}</div>}
      <section className="podium-grid section">
        {podium.map((row) => <div className="card podium-card" key={row.id}><strong>{medal(row.position)}</strong><h2 className="card-title">{row.participant_name}</h2><p className="p">{row.team_name || row.category || row.status}</p></div>)}
      </section>
      <section className="table-wrap section detail-bottom-safe">
        <table className="admin-table">
          <thead><tr><th>Pos</th><th>Jugador / equipo</th><th>Categoría</th><th>J</th><th>G</th><th>P</th><th>Pts</th><th>Estado</th></tr></thead>
          <tbody>
            {rows.map((row) => <tr key={row.id}><td>{row.position}</td><td>{row.participant_name}<br/><small>{row.team_name || ''}</small></td><td>{row.category || '-'}</td><td>{row.played || 0}</td><td>{row.wins || 0}</td><td>{row.losses || 0}</td><td>{row.points || 0}</td><td>{row.status || '-'}</td></tr>)}
          </tbody>
        </table>
        {!rows.length && <div className="card"><h2 className="card-title">Sin resultados publicados</h2><p className="p">Admin aún no ha publicado resultados de este torneo.</p></div>}
      </section>
    </AppShell>
  );
}
