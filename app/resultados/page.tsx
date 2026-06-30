'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/monitoring';

type ResultRow = {
  tournament_id: string;
  tournament?: { title: string } | null;
};

export default function ResultadosPage() {
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('prokicks_tournament_results')
        .select('tournament_id,tournament:prokicks_tournaments(title)')
        .eq('published', true);
      if (error) {
        captureError(error, { area: 'results-public-index' });
        setMsg('Los resultados se están preparando.');
        return;
      }
      setRows((data || []) as unknown as ResultRow[]);
    }
    load();
  }, []);

  const tournaments = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((row) => map.set(row.tournament_id, row.tournament?.title || row.tournament_id));
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [rows]);

  return (
    <AppShell active="torneos">
      <section className="hero section"><div className="kicker">Resultados</div><h1 className="h1">Resultados ProKicks</h1><p className="p">Podios y tablas oficiales publicadas por torneo.</p></section>
      {msg && <div className="alert warn section">{msg}</div>}
      <section className="list section detail-bottom-safe">
        {tournaments.map((tournament) => (
          <Link key={tournament.id} className="card row" href={`/torneos/${tournament.id}/resultados`}>
            <Trophy color="#173B63" />
            <div><h2 className="card-title">{tournament.title}</h2><p className="p">Ver podio y tabla completa</p></div>
          </Link>
        ))}
        {!tournaments.length && <div className="card"><h2 className="card-title">Sin resultados publicados</h2><p className="p">Aparecerán aquí cuando Admin los publique.</p></div>}
      </section>
    </AppShell>
  );
}
