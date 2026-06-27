-- PROKICKS PLAY · SPRINT 1.6.3 · OBSERVABILIDAD, PAGOS Y EMAIL
-- Ejecutar en Supabase SQL Editor antes o junto con el deploy.
-- Seguro: add column/table/index if not exists, sin borrar datos.

create extension if not exists "uuid-ossp";

alter table public.prokicks_tournaments
  add column if not exists state text default 'Ciudad de México',
  add column if not exists start_date date,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists max_players integer,
  add column if not exists current_players integer default 0,
  add column if not exists capacity integer,
  add column if not exists cost numeric default 0,
  add column if not exists status text default 'open',
  add column if not exists is_free boolean default true,
  add column if not exists currency text default 'MXN',
  add column if not exists payment_method text default 'sin_costo',
  add column if not exists payment_url text,
  add column if not exists payment_instructions text,
  add column if not exists rules text,
  add column if not exists updated_at timestamptz default now();

alter table public.prokicks_tournament_registrations
  add column if not exists participant_name text,
  add column if not exists participant_email text,
  add column if not exists player_name text,
  add column if not exists player_email text,
  add column if not exists nickname text,
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
  add column if not exists payment_status text default 'sin_costo',
  add column if not exists payment_method text default 'sin_costo',
  add column if not exists payment_url text,
  add column if not exists payment_reference text,
  add column if not exists paid_at timestamptz,
  add column if not exists registration_status text default 'confirmado',
  add column if not exists status text default 'confirmado',
  add column if not exists updated_at timestamptz default now();

update public.prokicks_tournaments
set
  starts_at = coalesce(starts_at, start_date::timestamptz),
  capacity = coalesce(capacity, max_players),
  is_free = coalesce(is_free, coalesce(cost, 0) = 0),
  currency = coalesce(currency, 'MXN'),
  payment_method = coalesce(payment_method, case when coalesce(cost, 0) = 0 then 'sin_costo' else 'pendiente_configurar' end)
where true;

update public.prokicks_tournament_registrations
set
  participant_name = coalesce(participant_name, player_name, participant_1_name),
  participant_email = coalesce(participant_email, player_email, contact_email),
  player_name = coalesce(player_name, participant_name, participant_1_name),
  player_email = coalesce(player_email, participant_email, contact_email),
  contact_email = coalesce(contact_email, participant_email, player_email),
  participant_1_name = coalesce(participant_1_name, participant_name, player_name),
  payment_status = coalesce(payment_status, case when coalesce(cost, 0) = 0 then 'sin_costo' else 'pago_pendiente' end),
  payment_method = coalesce(payment_method, case when coalesce(cost, 0) = 0 then 'sin_costo' else 'pendiente_configurar' end),
  registration_status = coalesce(registration_status, case when coalesce(cost, 0) = 0 then 'confirmado' else 'pendiente' end),
  status = case
    when status in ('registered', 'waitlist', 'checked_in') then 'confirmado'
    when status is null then coalesce(registration_status, 'confirmado')
    else status
  end
where true;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'prokicks_tournaments_status_check'
      and conrelid = 'public.prokicks_tournaments'::regclass
  ) then
    alter table public.prokicks_tournaments
      drop constraint prokicks_tournaments_status_check;
  end if;

  if exists (
    select 1 from pg_constraint
    where conname = 'prokicks_tournament_registrations_status_check'
      and conrelid = 'public.prokicks_tournament_registrations'::regclass
  ) then
    alter table public.prokicks_tournament_registrations
      drop constraint prokicks_tournament_registrations_status_check;
  end if;

  if exists (
    select 1 from pg_constraint
    where conname = 'prokicks_tournament_registrations_registration_status_check'
      and conrelid = 'public.prokicks_tournament_registrations'::regclass
  ) then
    alter table public.prokicks_tournament_registrations
      drop constraint prokicks_tournament_registrations_registration_status_check;
  end if;

  if exists (
    select 1 from pg_constraint
    where conname = 'prokicks_tournament_registrations_payment_status_check'
      and conrelid = 'public.prokicks_tournament_registrations'::regclass
  ) then
    alter table public.prokicks_tournament_registrations
      drop constraint prokicks_tournament_registrations_payment_status_check;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'prokicks_tournaments_status_check'
      and conrelid = 'public.prokicks_tournaments'::regclass
  ) then
    alter table public.prokicks_tournaments
      add constraint prokicks_tournaments_status_check
      check (status in ('draft','open','full','in_progress','finished','cancelled','published','closed'))
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'prokicks_tournament_registrations_status_check'
      and conrelid = 'public.prokicks_tournament_registrations'::regclass
  ) then
    alter table public.prokicks_tournament_registrations
      add constraint prokicks_tournament_registrations_status_check
      check (status in ('confirmado','pendiente','pago_pendiente','pagado','cancelado','cortesia','sin_costo'))
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'prokicks_tournament_registrations_registration_status_check'
      and conrelid = 'public.prokicks_tournament_registrations'::regclass
  ) then
    alter table public.prokicks_tournament_registrations
      add constraint prokicks_tournament_registrations_registration_status_check
      check (registration_status in ('confirmado','pendiente','pago_pendiente','pagado','cancelado','cortesia','sin_costo'))
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'prokicks_tournament_registrations_payment_status_check'
      and conrelid = 'public.prokicks_tournament_registrations'::regclass
  ) then
    alter table public.prokicks_tournament_registrations
      add constraint prokicks_tournament_registrations_payment_status_check
      check (payment_status in ('sin_costo','pago_pendiente','pagado','cancelado','cortesia'))
      not valid;
  end if;
end $$;

create table if not exists public.prokicks_email_queue (
  id uuid primary key default uuid_generate_v4(),
  recipient text,
  subject text,
  status text default 'pending',
  provider text default 'resend',
  error text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  sent_at timestamptz
);

create index if not exists idx_prokicks_tournaments_starts_at on public.prokicks_tournaments(starts_at);
create index if not exists idx_prokicks_tournaments_status on public.prokicks_tournaments(status);
create index if not exists idx_prokicks_registrations_tournament_id on public.prokicks_tournament_registrations(tournament_id);
create index if not exists idx_prokicks_registrations_contact_email on public.prokicks_tournament_registrations(contact_email);
create index if not exists idx_prokicks_registrations_modality on public.prokicks_tournament_registrations(modality);
create index if not exists idx_prokicks_registrations_payment_status on public.prokicks_tournament_registrations(payment_status);
create index if not exists idx_prokicks_email_queue_status on public.prokicks_email_queue(status);

alter table public.prokicks_email_queue enable row level security;

drop policy if exists "prokicks_email_queue_insert_public" on public.prokicks_email_queue;
create policy "prokicks_email_queue_insert_public"
on public.prokicks_email_queue
for insert
with check (true);

drop policy if exists "prokicks_email_queue_select_public" on public.prokicks_email_queue;
create policy "prokicks_email_queue_select_public"
on public.prokicks_email_queue
for select
using (true);
