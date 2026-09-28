'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { SupabaseNotice } from '@/components/SupabaseNotice';
import { VisionEntryCard } from '@/components/vision/VisionEntryCard';
import { ProxEntryCard } from '@/components/vision/ProxEntryCard';
import { realSpots, indoorTournament } from '@/lib/demo';
import { supabase } from '@/lib/supabase';
import { formatDateShortEs } from '@/lib/format';
import { GraduationCap, Star, Trophy, UserRound } from 'lucide-react';

type Challenge = {
id: string;
title: string;
spot_name?: string | null;
spot_code?: string | null;
type?: string | null;
status?: string | null;
};

type NextTournament = { id: string; title: string; starts_at: string | null };

function useCountdown(target: string | null) {
const [left, setLeft] = useState({ days: 0, hours: 0, minutes: 0, started: false });
useEffect(() => {
if (!target) return;
function tick() {
const diff = new Date(target as string).getTime() - Date.now();
if (diff <= 0) { setLeft({ days: 0, hours: 0, minutes: 0, started: true }); return; }
const days = Math.floor(diff / 86400000);
const hours = Math.floor((diff % 86400000) / 3600000);
const minutes = Math.floor((diff % 3600000) / 60000);
setLeft({ days, hours, minutes, started: false });
}
tick();
const id = setInterval(tick, 30000);
return () => clearInterval(id);
}, [target]);
return left;
}

export default function HomePage() {
const [challenges, setChallenges] = useState<Challenge[]>([]);
const [nextTournament, setNextTournament] = useState<NextTournament | null>({ id: indoorTournament.id, title: indoorTournament.title, starts_at: indoorTournament.starts_at });
const countdown = useCountdown(nextTournament?.starts_at || null);

useEffect(() => {
supabase
.from('prokicks_challenges')
.select('id,title,spot_name,spot_code,type,status,created_at')
.order('created_at', { ascending: false })
.limit(6)
.then(({ data }) => setChallenges((data || []) as Challenge[]));
}, []);

useEffect(() => {
supabase
.from('prokicks_tournaments')
.select('id,title,starts_at')
.eq('status', 'open')
.order('starts_at', { ascending: true })
.limit(1)
.then(({ data }) => {
if (data && data.length) setNextTournament(data[0] as NextTournament);
});
}, []);

return (
<AppShell active="home">
<SupabaseNotice />
<section className="hero home-hero section">
<div className="home-mark">PK</div>
<div className="kicker">ProKicks Play</div>
<h1 className="h1">Juega. Conecta. Compite.</h1>
<p className="p">Crea tu perfil, encuentra spots para echar la reta, conecta un spot y regístrate al torneo Indoor Community.</p>
<div className="grid-2 section">
<Link className="btn btn-primary" href="/registro"><UserRound size={18}/> Crear perfil</Link>
<Link className="btn btn-soft" href="/">Entrar / continuar</Link>
</div>
</section>

{nextTournament && (
<Link href={`/torneos/${nextTournament.id}`} className="next-tournament-card">
<div className="next-tournament-top">
<span className="next-tournament-badge"><Trophy size={14}/> Próximo torneo</span>
{nextTournament.starts_at && <span className="next-tournament-date">{formatDateShortEs(nextTournament.starts_at)}</span>}
</div>
<h3 className="next-tournament-title">{nextTournament.title}</h3>
{!nextTournament.starts_at || countdown.started ? (
<span className="next-tournament-live">Registro abierto</span>
) : (
<div className="next-tournament-countdown">
<div className="countdown-unit"><strong>{countdown.days}</strong><span>Días</span></div>
<div className="countdown-unit"><strong>{countdown.hours}</strong><span>Hrs</span></div>
<div className="countdown-unit"><strong>{countdown.minutes}</strong><span>Min</span></div>
</div>
)}
<span className="next-tournament-cta">Inscríbete aquí &rarr;</span>
</Link>
)}

<section className="grid-2 section home-stats">
<div className="stat"><span className="muted">Spots reales</span><strong>{realSpots.length}</strong></div>
<div className="stat"><span className="muted">Retas abiertas</span><strong>{challenges.length}</strong></div>
</section>

<section className="section">
<ProxEntryCard />
</section>

<section className="section">
<VisionEntryCard />
</section>

<section className="section">
<div className="card">
<div className="row"><GraduationCap color="#173B63" /><div><h3 className="card-title">Clínicas de Técnica Individual</h3><p className="p">Entrenamiento con feedback personalizado de un coach ProKicks. Anótate a la lista de interés.</p></div></div>
<Link className="btn btn-primary btn-full section" href="/clinicas">Ver clínicas</Link>
</div>
</section>

<section className="section">
<div className="row"><h2 className="h2">Retas cerca</h2><Link className="tag tag-blue" href="/retas">Ver todas</Link></div>
<div className="list">
{challenges.map((c) => (
<article className="card challenge-card" key={c.id}>
<div className="row"><h3 className="card-title">{c.title}</h3><span className="tag tag-warm">{c.status || 'Abierta'}</span></div>
<p className="p">{c.spot_name} · formato {c.type || 'abierto'}</p>
<div className="grid-2">
<Link href={`/retas/${c.id}`} className="btn btn-soft">Ver reta</Link>
<Link href={`/retas/${c.id}`} className="btn btn-primary">Unirme</Link>
</div>
</article>
))}
{!challenges.length && <section className="card"><h3 className="card-title">Aún no hay retas abiertas</h3><p className="p">Escanea un spot y crea la primera reta.</p><Link className="btn btn-primary btn-full section" href="/scan">Conectar spot</Link></section>}
</div>
</section>

<section className="section">
<div className="row"><h2 className="h2">Explora ProKicks</h2></div>
<div className="grid-2">
<Link className="btn btn-soft" href="/comunidad">Comunidad</Link>
<Link className="btn btn-soft" href="/tutoriales">Videos</Link>
<Link className="btn btn-soft" href="/galeria">Galería</Link>
<Link className="btn btn-soft" href="/clinicas">Clínicas</Link>
<Link className="btn btn-soft" href="/contacto">Contáctanos</Link>
<Link className="btn btn-soft" href="/faq">FAQ</Link>
<Link className="btn btn-soft" href="/comprar">Comprar</Link>
<Link className="btn btn-soft" href="/legal">Legal</Link>
<Link className="btn btn-soft" href="/perfil">Perfil</Link>
<a className="btn btn-warm" href="https://www.instagram.com/prokicksoficial?igsh=MTQyZDgwcTUwcTdxOQ==" target="_blank"><Star size={18}/> Seguir en Instagram</a>
</div>
</section>
</AppShell>
);
}
