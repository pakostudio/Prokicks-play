'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/monitoring';
import { FileSpreadsheet, FileText, Plus, Trash2, Upload } from 'lucide-react';
import { formatDateTimeEs } from '@/lib/format';

  type TournamentOption = { id: string; title: string };

type Match = {
  id: string;
  tournament_id: string;
  team_a_name: string;
  team_b_name: string;
  score_a: number | null;
  score_b: number | null;
  created_at?: string | null;
};

type Standing = {
  team: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  diff: number;
  points: number;
};

const emptyMatch = { team_a_name: '', team_b_name: '', score_a: '', score_b: '' };

async function exportExcel(rows: Record<string, unknown>[], sheetName: string, filename: string) {
  if (!rows.length) return;
  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

async function exportPDF(
  title: string,
  columns: { header: string; key: string }[],
  rows: Record<string, unknown>[],
  filename: string
) {
  if (!rows.length) return;
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setTextColor(23, 59, 99);
  doc.text(`ProKicks Play · ${title}`, 32, 32);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`${rows.length} fila${rows.length === 1 ? '' : 's'} · generado ${new Date().toLocaleDateString('es-MX')}`, 32, 46);

  autoTable(doc, {
    startY: 60,
    margin: { left: 24, right: 24 },
    tableWidth: pageWidth - 48,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(row[c.key] ?? '-'))),
    styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak', valign: 'middle' },
    headStyles: { fillColor: [23, 59, 99], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: [244, 246, 248] },
  });

  doc.save(filename);
}

const MATCHES_PDF_COLUMNS = [
  { header: 'Equipo A', key: 'equipo_a' },
  { header: 'Pts A', key: 'pts_a' },
  { header: 'Equipo B', key: 'equipo_b' },
  { header: 'Pts B', key: 'pts_b' },
];

const STANDINGS_PDF_COLUMNS = [
  { header: 'Pos', key: 'pos' },
  { header: 'Equipo', key: 'equipo' },
  { header: 'J', key: 'j' },
  { header: 'G', key: 'g' },
  { header: 'P', key: 'p' },
  { header: 'PF', key: 'pf' },
  { header: 'PC', key: 'pc' },
  { header: 'Dif', key: 'dif' },
  { header: 'Pts', key: 'pts' },
];

export default function AdminResultadosPage() {
  const [tournaments, setTournaments] = useState<TournamentOption[]>([]);
  const [tournamentId, setTournamentId] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [form, setForm] = useState(emptyMatch);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function loadTournaments() {
      const { data, error } = await supabase
        .from('prokicks_tournaments')
        .select('id,title')
        .order('starts_at', { ascending: false });
      if (error) {
        captureError(error, { area: 'admin-resultados-tournaments' });
        return;
      }
      const rows = (data || []) as TournamentOption[];
      setTournaments(rows);
      if (rows.length && !tournamentId) setTournamentId(rows[0].id);
    }
    loadTournaments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!tournamentId) return;
    loadMatches(tournamentId);
  }, [tournamentId]);

  async function loadMatches(id: string) {
    setMsg('');
    const { data, error } = await supabase
      .from('prokicks_tournament_matches')
      .select('id,tournament_id,team_a_name,team_b_name,score_a,score_b,created_at')
      .eq('tournament_id', id)
      .order('created_at', { ascending: false });
    if (error) {
      captureError(error, { area: 'admin-resultados-matches' });
      setMsg('No pudimos cargar los partidos.');
      return;
    }
    setMatches((data || []) as Match[]);
  }

  async function addMatch() {
    if (!tournamentId) return;
    const teamA = form.team_a_name.trim();
    const teamB = form.team_b_name.trim();
    if (!teamA || !teamB) {
      setMsg('Escribe el nombre del capitán/equipo A y B.');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('prokicks_tournament_matches').insert({
        tournament_id: tournamentId,
        team_a_name: teamA,
        team_b_name: teamB,
        score_a: form.score_a === '' ? null : Number(form.score_a),
        score_b: form.score_b === '' ? null : Number(form.score_b),
      });
      if (error) throw error;
      setForm(emptyMatch);
      await loadMatches(tournamentId);
    } catch (error) {
      captureError(error, { area: 'admin-resultados-add-match', tournamentId });
      setMsg('No pudimos guardar el partido.');
    } finally {
      setSaving(false);
    }
  }

  async function updateScore(matchId: string, field: 'score_a' | 'score_b', value: string) {
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, [field]: value === '' ? null : Number(value) } : m)));
    try {
      await supabase
        .from('prokicks_tournament_matches')
        .update({ [field]: value === '' ? null : Number(value), updated_at: new Date().toISOString() })
        .eq('id', matchId);
    } catch (error) {
      captureError(error, { area: 'admin-resultados-update-score', matchId });
    }
  }

  async function removeMatch(matchId: string) {
    try {
      await supabase.from('prokicks_tournament_matches').delete().eq('id', matchId);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
    } catch (error) {
      captureError(error, { area: 'admin-resultados-remove-match', matchId });
    }
  }

  const standings = useMemo(() => computeStandings(matches), [matches]);

  const selectedTournamentTitle = useMemo(
    () => tournaments.find((t) => t.id === tournamentId)?.title || 'torneo',
    [tournaments, tournamentId]
  );

  const matchesFlat = useMemo(
    () =>
      matches.map((m) => ({
        equipo_a: m.team_a_name,
        pts_a: m.score_a ?? '-',
        equipo_b: m.team_b_name,
        pts_b: m.score_b ?? '-',
      })),
    [matches]
  );

  const standingsFlat = useMemo(
    () =>
      standings.map((row, index) => ({
        pos: index + 1,
        equipo: row.team,
        j: row.played,
        g: row.wins,
        p: row.losses,
        pf: row.pointsFor,
        pc: row.pointsAgainst,
        dif: row.diff,
        pts: row.points,
      })),
    [standings]
  );

  async function publishStandings() {
    if (!tournamentId || !standings.length) return;
    setPublishing(true);
    setMsg('');
    try {
      await supabase.from('prokicks_tournament_results').delete().eq('tournament_id', tournamentId);

      const rows = standings.map((row, index) => ({
        tournament_id: tournamentId,
        position: index + 1,
        participant_name: row.team,
        team_name: row.team,
        played: row.played,
        wins: row.wins,
        losses: row.losses,
        points: row.points,
        status: index === 0 ? 'campeón' : 'participante',
        published: true,
      }));

      const { error } = await supabase.from('prokicks_tournament_results').insert(rows);
      if (error) throw error;
      setMsg('Clasificación publicada. Ya se ve en "Ver resultados" del torneo.');
    } catch (error) {
      captureError(error, { area: 'admin-resultados-publish', tournamentId });
      setMsg('No pudimos publicar la clasificación.');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <AdminShell active="resultados">
      <section className="hero section">
        <div className="kicker">Resultados</div>
        <h1 className="h1">Captura de resultados</h1>
        <p className="p">Cada torneo empieza en cero. Registra los partidos y publica la clasificación cuando esté lista.</p>
      </section>

      <section className="card form section">
        <div className="card-head">
          <div>
            <h2>Torneo</h2>
            <p>Elige el torneo activo para capturar sus partidos.</p>
          </div>
        </div>
        <select className="input" value={tournamentId} onChange={(e) => setTournamentId(e.target.value)}>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </section>

      <section className="card form section">
        <div className="card-head">
          <div>
            <h2>Nuevo partido</h2>
            <p>Nombre del capitán o equipo de cada lado (puede ser distinto al registro).</p>
          </div>
        </div>
        <input
          className="input"
          placeholder="Equipo / capitán A"
          value={form.team_a_name}
          onChange={(e) => setForm((f) => ({ ...f, team_a_name: e.target.value }))}
        />
        <input
          className="input"
          placeholder="Equipo / capitán B"
          value={form.team_b_name}
          onChange={(e) => setForm((f) => ({ ...f, team_b_name: e.target.value }))}
        />
        <div className="row">
          <input
            className="input"
            type="number"
            placeholder="Puntos A"
            value={form.score_a}
            onChange={(e) => setForm((f) => ({ ...f, score_a: e.target.value }))}
          />
          <input
            className="input"
            type="number"
            placeholder="Puntos B"
            value={form.score_b}
            onChange={(e) => setForm((f) => ({ ...f, score_b: e.target.value }))}
          />
        </div>
        {msg && <div className="alert warn">{msg}</div>}
        <button className="btn btn-primary btn-full" disabled={saving} onClick={addMatch}>
          <Plus size={16} /> {saving ? 'Guardando...' : 'Agregar partido'}
        </button>
      </section>

      <section className="card section">
        <div className="card-head">
          <div>
            <h2>Partidos capturados</h2>
            <p>Edita el marcador directamente en la tabla.</p>
            <p style={{ fontWeight: 600 }}>Torneo: {selectedTournamentTitle}</p>
          </div>
        </div>
        <div className="grid-2 tight">
          <button
            className="btn btn-primary"
            disabled={!matches.length}
            onClick={() => exportExcel(matchesFlat, 'Partidos', `prokicks_partidos_${selectedTournamentTitle}.xlsx`)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <FileSpreadsheet size={18} color="#21A366" /> Exportar partidos Excel
          </button>
          <button
            className="btn btn-primary"
            disabled={!matches.length}
            onClick={() => exportPDF('Partidos', MATCHES_PDF_COLUMNS, matchesFlat, `prokicks_partidos_${selectedTournamentTitle}.pdf`)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <FileText size={18} color="#E13B3B" /> Exportar partidos PDF
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr><th>Equipo A</th><th>Pts A</th><th>Equipo B</th><th>Pts B</th><th>Fecha</th><th></th></tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id}>
                <td>{m.team_a_name}</td>
                <td>
                  <input className="input" type="number" value={m.score_a ?? ''} onChange={(e) => updateScore(m.id, 'score_a', e.target.value)} />
                </td>
                <td>{m.team_b_name}</td>
                <td>
                  <input className="input" type="number" value={m.score_b ?? ''} onChange={(e) => updateScore(m.id, 'score_b', e.target.value)} />
                </td>
                <td>{m.created_at ? formatDateTimeEs(m.created_at) : '-'}</td>
                <td>
                  <button className="tag tag-warm" onClick={() => removeMatch(m.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {!matches.length && (
              <tr><td colSpan={6}>Sin partidos capturados todavía.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="card section">
        <div className="card-head">
          <div>
            <h2>Clasificación (automática)</h2>
            <p>1 punto por victoria, 0 por derrota. Empate se resuelve por diferencia de puntos.</p>
          </div>
        </div>
        <div className="grid-2 tight">
          <button
            className="btn btn-primary"
            disabled={!standings.length}
            onClick={() => exportExcel(standingsFlat, 'Clasificacion', `prokicks_clasificacion_${selectedTournamentTitle}.xlsx`)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <FileSpreadsheet size={18} color="#21A366" /> Exportar clasificación Excel
          </button>
          <button
            className="btn btn-primary"
            disabled={!standings.length}
            onClick={() => exportPDF('Clasificación', STANDINGS_PDF_COLUMNS, standingsFlat, `prokicks_clasificacion_${selectedTournamentTitle}.pdf`)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <FileText size={18} color="#E13B3B" /> Exportar clasificación PDF
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr><th>Pos</th><th>Equipo</th><th>J</th><th>G</th><th>P</th><th>PF</th><th>PC</th><th>Dif</th><th>Pts</th></tr>
          </thead>
          <tbody>
            {standings.map((row, index) => (
              <tr key={row.team}>
                <td>{index + 1}</td>
                <td>{row.team}</td>
                <td>{row.played}</td>
                <td>{row.wins}</td>
                <td>{row.losses}</td>
                <td>{row.pointsFor}</td>
                <td>{row.pointsAgainst}</td>
                <td>{row.diff}</td>
                <td>{row.points}</td>
              </tr>
            ))}
            {!standings.length && (
              <tr><td colSpan={9}>Captura al menos un partido con marcador para ver la tabla.</td></tr>
            )}
          </tbody>
        </table>
        <button className="btn btn-warm btn-full section" disabled={publishing || !standings.length} onClick={publishStandings}>
          <Upload size={16} /> {publishing ? 'Publicando...' : 'Publicar clasificación'}
        </button>
      </section>
    </AdminShell>
  );
}

function computeStandings(matches: Match[]): Standing[] {
  const table = new Map<string, Standing>();

  function ensure(team: string) {
    if (!table.has(team)) {
      table.set(team, { team, played: 0, wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, diff: 0, points: 0 });
    }
    return table.get(team)!;
  }

  matches.forEach((m) => {
    if (m.score_a === null || m.score_b === null || m.score_a === undefined || m.score_b === undefined) return;

    const a = ensure(m.team_a_name);
    const b = ensure(m.team_b_name);

    a.played += 1;
    b.played += 1;
    a.pointsFor += m.score_a;
    a.pointsAgainst += m.score_b;
    b.pointsFor += m.score_b;
    b.pointsAgainst += m.score_a;

    if (m.score_a > m.score_b) {
      a.wins += 1;
      a.points += 1;
      b.losses += 1;
    } else if (m.score_b > m.score_a) {
      b.wins += 1;
      b.points += 1;
      a.losses += 1;
    }
  });

  const rows = Array.from(table.values()).map((row) => ({ ...row, diff: row.pointsFor - row.pointsAgainst }));
  rows.sort((x, y) => y.points - x.points || y.diff - x.diff || y.pointsFor - x.pointsFor);
  return rows;
}
