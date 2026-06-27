-- PROKICKS PLAY · SPRINT 1.6.4 · QA HOTFIX
-- Ejecutar en Supabase SQL Editor.
-- Objetivo: asegurar que la cola de emails tenga columnas usadas por la API actual,
-- incluso si la tabla ya existia con un schema anterior.

create extension if not exists "uuid-ossp";

create table if not exists public.prokicks_email_queue (
  id uuid primary key default uuid_generate_v4()
);

alter table public.prokicks_email_queue
  add column if not exists recipient text,
  add column if not exists subject text,
  add column if not exists status text default 'pending',
  add column if not exists provider text default 'resend',
  add column if not exists error text,
  add column if not exists payload jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists sent_at timestamptz;

create index if not exists idx_prokicks_email_queue_status
  on public.prokicks_email_queue(status);

create index if not exists idx_prokicks_email_queue_created_at
  on public.prokicks_email_queue(created_at desc);

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
