-- PROKICKS PLAY · SPRINT 1.1 · REGISTRO + MENORES + CONSENTIMIENTOS
-- Ejecutar en Supabase SQL Editor dentro del proyecto smsoluciones-os.
-- Seguro: solo toca tablas con prefijo prokicks_.

create extension if not exists "uuid-ossp";

alter table public.prokicks_profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists gender text check (gender is null or gender in ('Hombre','Mujer','Otro','Prefiero no decirlo')),
  add column if not exists birth_date date,
  add column if not exists is_minor boolean default false,
  add column if not exists account_status text default 'active' check (account_status in ('active','pending_parental_consent','restricted','suspended')),
  add column if not exists email text,
  add column if not exists state text,
  add column if not exists municipality text,
  add column if not exists avatar_key text,
  add column if not exists privacy_mode text default 'standard' check (privacy_mode in ('standard','minor_private')),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists prokicks_profiles_alias_unique_idx on public.prokicks_profiles(alias) where alias is not null;
create index if not exists prokicks_profiles_state_idx on public.prokicks_profiles(state);
create index if not exists prokicks_profiles_account_status_idx on public.prokicks_profiles(account_status);

create table if not exists public.prokicks_user_consents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.prokicks_profiles(id) on delete cascade,
  consent_type text not null check (consent_type in ('terms','privacy','promotions','media_release')),
  consented boolean not null default false,
  version text not null,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create table if not exists public.prokicks_guardian_consents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.prokicks_profiles(id) on delete cascade,
  minor_email text,
  guardian_name text not null,
  guardian_email text not null,
  guardian_relation text not null check (guardian_relation in ('Madre','Padre','Tutor legal')),
  consent_status text default 'pending' check (consent_status in ('pending','approved','rejected','revoked')),
  consent_version text not null,
  approved_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now()
);

create unique index if not exists prokicks_user_consents_unique_idx on public.prokicks_user_consents(user_id, consent_type, version);
create unique index if not exists prokicks_guardian_consents_unique_idx on public.prokicks_guardian_consents(user_id, consent_version);

create table if not exists public.prokicks_legal_documents (
  id uuid primary key default uuid_generate_v4(),
  document_type text not null check (document_type in ('terms','privacy','minor_consent','media_release')),
  version text not null,
  title text not null,
  status text default 'draft' check (status in ('draft','active','archived')),
  effective_at timestamptz,
  created_at timestamptz default now(),
  unique(document_type, version)
);

insert into public.prokicks_legal_documents (document_type, version, title, status, effective_at)
values
  ('terms', 'terms-v1-2026-06', 'Términos y Condiciones ProKicks Play', 'draft', now()),
  ('privacy', 'privacy-v1-2026-06', 'Aviso de Privacidad ProKicks Play', 'draft', now()),
  ('minor_consent', 'terms-v1-2026-06', 'Autorización de madre, padre o tutor', 'draft', now()),
  ('media_release', 'media-v1-2026-06', 'Autorización de uso de imagen en eventos', 'draft', now())
on conflict (document_type, version) do nothing;

alter table public.prokicks_user_consents enable row level security;
alter table public.prokicks_guardian_consents enable row level security;
alter table public.prokicks_legal_documents enable row level security;

drop policy if exists "prokicks_user_consents_select_own" on public.prokicks_user_consents;
create policy "prokicks_user_consents_select_own" on public.prokicks_user_consents
for select using (auth.uid() = user_id);

drop policy if exists "prokicks_user_consents_insert_own" on public.prokicks_user_consents;
create policy "prokicks_user_consents_insert_own" on public.prokicks_user_consents
for insert with check (auth.uid() = user_id);

drop policy if exists "prokicks_guardian_consents_select_own" on public.prokicks_guardian_consents;
create policy "prokicks_guardian_consents_select_own" on public.prokicks_guardian_consents
for select using (auth.uid() = user_id);

drop policy if exists "prokicks_guardian_consents_insert_own" on public.prokicks_guardian_consents;
create policy "prokicks_guardian_consents_insert_own" on public.prokicks_guardian_consents
for insert with check (auth.uid() = user_id);

drop policy if exists "prokicks_legal_documents_select" on public.prokicks_legal_documents;
create policy "prokicks_legal_documents_select" on public.prokicks_legal_documents
for select using (true);

create or replace function public.handle_prokicks_new_user()
returns trigger as $$
declare
  calculated_is_minor boolean;
begin
  calculated_is_minor := coalesce((new.raw_user_meta_data->>'is_minor')::boolean, false);

  insert into public.prokicks_profiles (
    id, display_name, first_name, last_name, gender, birth_date, is_minor,
    account_status, email, state, municipality, alias, avatar_key, privacy_mode
  ) values (
    new.id,
    coalesce(nullif(trim(concat(new.raw_user_meta_data->>'first_name', ' ', new.raw_user_meta_data->>'last_name')), ''), split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    nullif(new.raw_user_meta_data->>'gender',''),
    nullif(new.raw_user_meta_data->>'birth_date','')::date,
    calculated_is_minor,
    coalesce(new.raw_user_meta_data->>'account_status', case when calculated_is_minor then 'pending_parental_consent' else 'active' end),
    new.email,
    new.raw_user_meta_data->>'state',
    new.raw_user_meta_data->>'municipality',
    coalesce(nullif(new.raw_user_meta_data->>'nickname',''), split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar',
    case when calculated_is_minor then 'minor_private' else 'standard' end
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    gender = excluded.gender,
    birth_date = excluded.birth_date,
    is_minor = excluded.is_minor,
    account_status = excluded.account_status,
    email = excluded.email,
    state = excluded.state,
    municipality = excluded.municipality,
    alias = excluded.alias,
    avatar_key = excluded.avatar_key,
    privacy_mode = excluded.privacy_mode,
    updated_at = now();

  insert into public.prokicks_user_consents (user_id, consent_type, consented, version)
  values
    (new.id, 'terms', true, coalesce(new.raw_user_meta_data->>'terms_version', 'terms-v1-2026-06')),
    (new.id, 'privacy', true, coalesce(new.raw_user_meta_data->>'privacy_version', 'privacy-v1-2026-06')),
    (new.id, 'promotions', coalesce((new.raw_user_meta_data->>'promotions_consent')::boolean, false), 'marketing-v1-2026-06'),
    (new.id, 'media_release', coalesce((new.raw_user_meta_data->>'media_consent')::boolean, false), 'media-v1-2026-06')
  on conflict do nothing;

  if calculated_is_minor then
    insert into public.prokicks_guardian_consents (
      user_id, minor_email, guardian_name, guardian_email, guardian_relation, consent_status, consent_version
    ) values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'guardian_name', ''),
      coalesce(new.raw_user_meta_data->>'guardian_email', ''),
      coalesce(new.raw_user_meta_data->>'guardian_relation', 'Tutor legal'),
      'pending',
      coalesce(new.raw_user_meta_data->>'terms_version', 'terms-v1-2026-06')
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_prokicks_auth_user_created on auth.users;
create trigger on_prokicks_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_prokicks_new_user();
