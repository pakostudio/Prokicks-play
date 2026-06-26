-- PROKICKS PLAY · SPRINT 1.2 · REGISTRO, MENORES Y CONSENTIMIENTOS
-- Seguro para proyecto compartido: solo usa tablas con prefijo prokicks_.

create extension if not exists "uuid-ossp";

alter table public.prokicks_profiles
add column if not exists first_name text,
add column if not exists last_name text,
add column if not exists birth_date date,
add column if not exists gender text,
add column if not exists state text,
add column if not exists municipality text,
add column if not exists avatar_key text,
add column if not exists is_minor boolean default false,
add column if not exists guardian_required boolean default false,
add column if not exists guardian_status text default 'not_required',
add column if not exists registration_completed boolean default false,
add column if not exists account_status text default 'active',
add column if not exists email text,
add column if not exists privacy_mode text default 'standard',
add column if not exists updated_at timestamptz default now();

create table if not exists public.prokicks_legal_documents (
  id uuid primary key default uuid_generate_v4(),
  document_type text not null,
  version text not null,
  title text not null,
  url text,
  active boolean default true,
  created_at timestamptz default now(),
  unique(document_type, version)
);

create table if not exists public.prokicks_user_consents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.prokicks_profiles(id) on delete cascade,
  document_type text not null,
  document_version text not null,
  accepted boolean not null default false,
  accepted_at timestamptz default now(),
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create table if not exists public.prokicks_guardian_consents (
  id uuid primary key default uuid_generate_v4(),
  minor_user_id uuid references public.prokicks_profiles(id) on delete cascade,
  guardian_first_name text,
  guardian_last_name text,
  guardian_email text,
  relationship text,
  document_version text not null default 'v1.0',
  status text default 'pending',
  consent_token uuid default uuid_generate_v4(),
  consent_sent_at timestamptz default now(),
  consent_confirmed_at timestamptz,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

alter table public.prokicks_legal_documents enable row level security;
alter table public.prokicks_user_consents enable row level security;
alter table public.prokicks_guardian_consents enable row level security;

drop policy if exists "prokicks_legal_documents_select" on public.prokicks_legal_documents;
create policy "prokicks_legal_documents_select" on public.prokicks_legal_documents for select using (active = true);

drop policy if exists "prokicks_user_consents_select_own" on public.prokicks_user_consents;
create policy "prokicks_user_consents_select_own" on public.prokicks_user_consents for select using (auth.uid() = user_id);

drop policy if exists "prokicks_user_consents_insert_own" on public.prokicks_user_consents;
create policy "prokicks_user_consents_insert_own" on public.prokicks_user_consents for insert with check (auth.uid() = user_id);

drop policy if exists "prokicks_guardian_consents_select_own_minor" on public.prokicks_guardian_consents;
create policy "prokicks_guardian_consents_select_own_minor" on public.prokicks_guardian_consents for select using (auth.uid() = minor_user_id);

drop policy if exists "prokicks_guardian_consents_insert_own_minor" on public.prokicks_guardian_consents;
create policy "prokicks_guardian_consents_insert_own_minor" on public.prokicks_guardian_consents for insert with check (auth.uid() = minor_user_id);

insert into public.prokicks_legal_documents (document_type, version, title, url, active)
values
  ('terms', 'v1.0', 'Términos y Condiciones ProKicks Play', '/legal/terms', true),
  ('privacy_notice', 'v1.0', 'Aviso de Privacidad ProKicks Play', '/legal/privacy', true),
  ('minor_consent', 'v1.0', 'Autorización de madre, padre o tutor', '/legal/minor-consent', true),
  ('image_release', 'v1.0', 'Autorización de uso de imagen', '/legal/image-release', true),
  ('marketing_consent', 'v1.0', 'Consentimiento para comunicaciones promocionales', '/legal/marketing', true)
on conflict (document_type, version) do update set url = excluded.url, active = true;
