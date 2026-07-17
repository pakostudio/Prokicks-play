-- PROKICKS VISION · MODULO INDEPENDIENTE · MIGRACION INICIAL
-- No modifica ninguna tabla existente. Solo agrega tablas nuevas con prefijo vision_.
-- Ejecutar en Supabase SQL Editor del proyecto real de ProKicks Play.

create extension if not exists "uuid-ossp";

-- ============================================================
-- vision_sessions: un bloque de entrenamiento (max 20 min)
-- ============================================================
create table if not exists public.vision_sessions (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.prokicks_profiles(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','calibrating','active','paused','completed','cancelled')),
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer,
  block_number integer not null default 1,
  camera_1_label text,
  camera_2_label text,
  created_at timestamptz not null default now()
);

create index if not exists vision_sessions_coach_id_idx on public.vision_sessions(coach_id);
create index if not exists vision_sessions_created_at_idx on public.vision_sessions(created_at);
create index if not exists vision_sessions_status_idx on public.vision_sessions(status);

-- ============================================================
-- vision_session_players: hasta 4 jugadores por sesion
-- ============================================================
create table if not exists public.vision_session_players (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.vision_sessions(id) on delete cascade,
  player_id uuid not null references public.prokicks_profiles(id) on delete cascade,
  position_number integer not null check (position_number between 1 and 4),
  tracking_id text,
  calibration_confidence numeric,
  created_at timestamptz not null default now(),
  unique(session_id, position_number),
  unique(session_id, player_id)
);

create index if not exists vision_session_players_session_id_idx on public.vision_session_players(session_id);
create index if not exists vision_session_players_player_id_idx on public.vision_session_players(player_id);

-- ============================================================
-- vision_calibrations: bounding boxes usados para asignar tracking_id -> jugador
-- ============================================================
create table if not exists public.vision_calibrations (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.vision_sessions(id) on delete cascade,
  camera_id text not null,
  player_id uuid references public.prokicks_profiles(id) on delete set null,
  tracking_id text,
  bounding_box jsonb,
  created_at timestamptz not null default now()
);

create index if not exists vision_calibrations_session_id_idx on public.vision_calibrations(session_id);
create index if not exists vision_calibrations_player_id_idx on public.vision_calibrations(player_id);
create index if not exists vision_calibrations_created_at_idx on public.vision_calibrations(created_at);

-- ============================================================
-- vision_events: eventos crudos generados por el motor (contacto, pase, etc.)
-- ============================================================
create table if not exists public.vision_events (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.vision_sessions(id) on delete cascade,
  player_id uuid references public.prokicks_profiles(id) on delete set null,
  event_type text not null,
  timestamp_ms bigint not null,
  confidence numeric,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists vision_events_session_id_idx on public.vision_events(session_id);
create index if not exists vision_events_player_id_idx on public.vision_events(player_id);
create index if not exists vision_events_created_at_idx on public.vision_events(created_at);

-- ============================================================
-- vision_metrics: metricas calculadas por jugador/sesion
-- metric_key documentado en lib/vision/types.ts (VISION_METRIC_KEYS)
-- ============================================================
create table if not exists public.vision_metrics (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.vision_sessions(id) on delete cascade,
  player_id uuid not null references public.prokicks_profiles(id) on delete cascade,
  metric_key text not null,
  metric_value numeric,
  metric_unit text,
  confidence numeric,
  created_at timestamptz not null default now()
);

create index if not exists vision_metrics_session_id_idx on public.vision_metrics(session_id);
create index if not exists vision_metrics_player_id_idx on public.vision_metrics(player_id);
create index if not exists vision_metrics_created_at_idx on public.vision_metrics(created_at);
create index if not exists vision_metrics_metric_key_idx on public.vision_metrics(metric_key);

-- ============================================================
-- sensor_events: FASE FUTURA. Contrato preparado para ESP32.
-- No se usa todavia, no se conecta a ningun hardware.
-- ============================================================
create table if not exists public.sensor_events (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.vision_sessions(id) on delete cascade,
  sensor_id text not null,
  timestamp_ms bigint not null,
  impact_detected boolean default false,
  relative_intensity numeric,
  axis_x numeric,
  axis_y numeric,
  axis_z numeric,
  created_at timestamptz not null default now()
);

create index if not exists sensor_events_session_id_idx on public.sensor_events(session_id);
create index if not exists sensor_events_sensor_id_idx on public.sensor_events(sensor_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- Reglas: coach ve/edita solo sus sesiones. Jugador solo lee sus propias metricas.
-- Admin (prokicks_profiles.role = 'admin') acceso total. Anonimo: nada.
-- ============================================================
alter table public.vision_sessions enable row level security;
alter table public.vision_session_players enable row level security;
alter table public.vision_calibrations enable row level security;
alter table public.vision_events enable row level security;
alter table public.vision_metrics enable row level security;
alter table public.sensor_events enable row level security;

-- vision_sessions -------------------------------------------------
drop policy if exists "vision_sessions_select_own_or_admin" on public.vision_sessions;
create policy "vision_sessions_select_own_or_admin" on public.vision_sessions
for select using (
  auth.uid() = coach_id
  or exists (select 1 from public.prokicks_profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.vision_session_players vsp
    where vsp.session_id = vision_sessions.id and vsp.player_id = auth.uid()
  )
);

drop policy if exists "vision_sessions_insert_own" on public.vision_sessions;
create policy "vision_sessions_insert_own" on public.vision_sessions
for insert with check (auth.uid() = coach_id);

drop policy if exists "vision_sessions_update_own_or_admin" on public.vision_sessions;
create policy "vision_sessions_update_own_or_admin" on public.vision_sessions
for update using (
  auth.uid() = coach_id
  or exists (select 1 from public.prokicks_profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "vision_sessions_delete_own_or_admin" on public.vision_sessions;
create policy "vision_sessions_delete_own_or_admin" on public.vision_sessions
for delete using (
  auth.uid() = coach_id
  or exists (select 1 from public.prokicks_profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- vision_session_players -------------------------------------------
drop policy if exists "vision_session_players_select" on public.vision_session_players;
create policy "vision_session_players_select" on public.vision_session_players
for select using (
  auth.uid() = player_id
  or exists (select 1 from public.vision_sessions s where s.id = session_id and s.coach_id = auth.uid())
  or exists (select 1 from public.prokicks_profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "vision_session_players_write_coach" on public.vision_session_players;
create policy "vision_session_players_write_coach" on public.vision_session_players
for insert with check (
  exists (select 1 from public.vision_sessions s where s.id = session_id and s.coach_id = auth.uid())
);

drop policy if exists "vision_session_players_update_coach" on public.vision_session_players;
create policy "vision_session_players_update_coach" on public.vision_session_players
for update using (
  exists (select 1 from public.vision_sessions s where s.id = session_id and s.coach_id = auth.uid())
  or exists (select 1 from public.prokicks_profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "vision_session_players_delete_coach" on public.vision_session_players;
create policy "vision_session_players_delete_coach" on public.vision_session_players
for delete using (
  exists (select 1 from public.vision_sessions s where s.id = session_id and s.coach_id = auth.uid())
  or exists (select 1 from public.prokicks_profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- vision_calibrations -------------------------------------------------
drop policy if exists "vision_calibrations_select" on public.vision_calibrations;
create policy "vision_calibrations_select" on public.vision_calibrations
for select using (
  auth.uid() = player_id
  or exists (select 1 from public.vision_sessions s where s.id = session_id and s.coach_id = auth.uid())
  or exists (select 1 from public.prokicks_profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "vision_calibrations_write_coach" on public.vision_calibrations;
create policy "vision_calibrations_write_coach" on public.vision_calibrations
for insert with check (
  exists (select 1 from public.vision_sessions s where s.id = session_id and s.coach_id = auth.uid())
);

drop policy if exists "vision_calibrations_update_coach" on public.vision_calibrations;
create policy "vision_calibrations_update_coach" on public.vision_calibrations
for update using (
  exists (select 1 from public.vision_sessions s where s.id = session_id and s.coach_id = auth.uid())
  or exists (select 1 from public.prokicks_profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- vision_events -------------------------------------------------
drop policy if exists "vision_events_select" on public.vision_events;
create policy "vision_events_select" on public.vision_events
for select using (
  auth.uid() = player_id
  or exists (select 1 from public.vision_sessions s where s.id = session_id and s.coach_id = auth.uid())
  or exists (select 1 from public.prokicks_profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "vision_events_write_coach" on public.vision_events;
create policy "vision_events_write_coach" on public.vision_events
for insert with check (
  exists (select 1 from public.vision_sessions s where s.id = session_id and s.coach_id = auth.uid())
);

-- vision_metrics -------------------------------------------------
drop policy if exists "vision_metrics_select" on public.vision_metrics;
create policy "vision_metrics_select" on public.vision_metrics
for select using (
  auth.uid() = player_id
  or exists (select 1 from public.vision_sessions s where s.id = session_id and s.coach_id = auth.uid())
  or exists (select 1 from public.prokicks_profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "vision_metrics_write_coach" on public.vision_metrics;
create policy "vision_metrics_write_coach" on public.vision_metrics
for insert with check (
  exists (select 1 from public.vision_sessions s where s.id = session_id and s.coach_id = auth.uid())
);

-- sensor_events (fase futura) -------------------------------------------------
drop policy if exists "sensor_events_select" on public.sensor_events;
create policy "sensor_events_select" on public.sensor_events
for select using (
  exists (select 1 from public.vision_sessions s where s.id = session_id and s.coach_id = auth.uid())
  or exists (select 1 from public.prokicks_profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "sensor_events_write_coach" on public.sensor_events;
create policy "sensor_events_write_coach" on public.sensor_events
for insert with check (
  exists (select 1 from public.vision_sessions s where s.id = session_id and s.coach_id = auth.uid())
);

-- Nota de seguridad: ninguna policy usa "using (true)". El acceso anonimo
-- (rol anon sin auth.uid()) no puede leer ni escribir ninguna tabla vision_*
-- porque auth.uid() es null para anon y ninguna condicion evalua true con null.
