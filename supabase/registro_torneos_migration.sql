-- PROKICKS PLAY · SPRINT 1.6 · REGISTRO A TORNEOS
-- Ejecutar en Supabase SQL Editor antes o junto con el deploy.
-- Agrega campos reales para individual/dupla, rama, participantes, WhatsApp y consentimientos.

create extension if not exists "uuid-ossp";

alter table public.prokicks_tournament_registrations
add column if not exists participant_name text,
add column if not exists participant_email text,
add column if not exists player_name text,
add column if not exists player_email text,
add column if not exists team_name text,
add column if not exists modality text default 'individual',
add column if not exists branch text default 'libre',
add column if not exists age_category text default 'mayor_18',
add column if not exists contact_email text,
add column if not exists contact_whatsapp text,
add column if not exists participant_1_name text,
add column if not exists participant_1_age integer,
add column if not exists participant_1_whatsapp text,
add column if not exists participant_2_name text,
add column if not exists participant_2_age integer,
add column if not exists participant_2_whatsapp text,
add column if not exists participants jsonb default '[]'::jsonb,
add column if not exists accepted_rules boolean default false,
add column if not exists accepted_image_release boolean default false,
add column if not exists rules_version text default 'prokicks-rules-v1',
add column if not exists guardian_required boolean default false,
add column if not exists guardian_name text,
add column if not exists guardian_whatsapp text,
add column if not exists guardian_email text,
add column if not exists guardian_accepted boolean default false,
add column if not exists registration_payload jsonb default '{}'::jsonb,
add column if not exists updated_at timestamptz default now();

update public.prokicks_tournament_registrations
set
  participant_name = coalesce(participant_name, player_name, participant_1_name),
  participant_email = coalesce(participant_email, player_email, contact_email),
  player_name = coalesce(player_name, participant_name, participant_1_name),
  player_email = coalesce(player_email, participant_email, contact_email),
  contact_email = coalesce(contact_email, participant_email, player_email),
  participant_1_name = coalesce(participant_1_name, participant_name, player_name)
where true;

create index if not exists idx_prokicks_registrations_tournament_id
on public.prokicks_tournament_registrations(tournament_id);

create index if not exists idx_prokicks_registrations_contact_email
on public.prokicks_tournament_registrations(contact_email);

create index if not exists idx_prokicks_registrations_modality
on public.prokicks_tournament_registrations(modality);

-- Mantener políticas abiertas solo para demo/MVP. En producción se debe cerrar por rol admin.
alter table public.prokicks_tournament_registrations enable row level security;

drop policy if exists "prokicks_tournament_registrations_select" on public.prokicks_tournament_registrations;
create policy "prokicks_tournament_registrations_select"
on public.prokicks_tournament_registrations
for select
using (true);

drop policy if exists "prokicks_tournament_registrations_insert_public" on public.prokicks_tournament_registrations;
create policy "prokicks_tournament_registrations_insert_public"
on public.prokicks_tournament_registrations
for insert
with check (true);
