-- PROKICKS PLAY · SPRINT 1.2 · TORNEOS DEMO, REGISTROS Y EXPORT ADMIN
-- Primera etapa sin costos. Tablas aisladas con prefijo prokicks_.

create extension if not exists "uuid-ossp";

create table if not exists public.prokicks_tournaments (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  city text default 'CDMX',
  venue text,
  spot_id uuid references public.prokicks_spots(id) on delete set null,
  start_date date not null,
  format text default '1v1',
  status text default 'published' check (status in ('draft','published','closed','finished','cancelled')),
  registration_status text default 'open' check (registration_status in ('open','closed')),
  max_players integer,
  current_players integer default 0,
  cost numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.prokicks_tournament_registrations (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references public.prokicks_tournaments(id) on delete cascade,
  user_id uuid references public.prokicks_profiles(id) on delete set null,
  participant_name text not null,
  participant_email text not null,
  nickname text,
  notes text,
  status text default 'registered' check (status in ('registered','waitlist','cancelled','checked_in')),
  cost numeric default 0,
  created_at timestamptz default now(),
  unique(tournament_id, participant_email)
);

alter table public.prokicks_tournaments enable row level security;
alter table public.prokicks_tournament_registrations enable row level security;

drop policy if exists "prokicks_tournaments_select" on public.prokicks_tournaments;
create policy "prokicks_tournaments_select" on public.prokicks_tournaments for select using (true);

drop policy if exists "prokicks_tournaments_insert_auth" on public.prokicks_tournaments;
create policy "prokicks_tournaments_insert_auth" on public.prokicks_tournaments for insert with check (auth.uid() is not null);

drop policy if exists "prokicks_tournament_registrations_select" on public.prokicks_tournament_registrations;
create policy "prokicks_tournament_registrations_select" on public.prokicks_tournament_registrations for select using (true);

drop policy if exists "prokicks_tournament_registrations_insert_public" on public.prokicks_tournament_registrations;
create policy "prokicks_tournament_registrations_insert_public" on public.prokicks_tournament_registrations for insert with check (true);

insert into public.prokicks_tournaments (title, description, city, venue, start_date, format, status, registration_status, max_players, current_players, cost)
values
  ('Copa ProKicks Roma Norte', 'Torneo demo sin costo para validar comunidad y experiencia ProKicks.', 'CDMX', 'ProKicks Roma Norte', '2026-07-15', '1v1 / fase rápida', 'published', 'open', 32, 8, 0),
  ('Reto ProKicks Polanco 1v1', 'Formato rápido de eliminación para probar ranking y resultados.', 'CDMX', 'ProKicks Polanco', '2026-07-22', '1v1', 'published', 'open', 24, 5, 0),
  ('Open ProKicks Coyoacán', 'Demo abierto para presentar registro a torneos y administración.', 'CDMX', 'ProKicks Coyoacán', '2026-07-29', '2v2', 'published', 'open', 40, 0, 0)
on conflict do nothing;

update public.prokicks_legal_documents set url = '/legal/terms' where document_type = 'terms' and version = 'v1.0';
update public.prokicks_legal_documents set url = '/legal/privacy' where document_type = 'privacy_notice' and version = 'v1.0';
update public.prokicks_legal_documents set url = '/legal/minor-consent' where document_type = 'minor_consent' and version = 'v1.0';
update public.prokicks_legal_documents set url = '/legal/image-release' where document_type = 'image_release' and version = 'v1.0';
update public.prokicks_legal_documents set url = '/legal/marketing' where document_type = 'marketing_consent' and version = 'v1.0';
