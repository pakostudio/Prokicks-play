-- Sprint 1.7 - Customer Journey Demo Ready
-- Seguro: no borra datos, usa create/add if not exists y policies de demo inicial.

create extension if not exists pgcrypto;

create table if not exists public.prokicks_profiles (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  whatsapp text,
  nickname text,
  avatar_id text,
  avatar_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.prokicks_profiles add column if not exists name text;
alter table public.prokicks_profiles add column if not exists email text;
alter table public.prokicks_profiles add column if not exists whatsapp text;
alter table public.prokicks_profiles add column if not exists nickname text;
alter table public.prokicks_profiles add column if not exists avatar_id text;
alter table public.prokicks_profiles add column if not exists avatar_name text;
alter table public.prokicks_profiles add column if not exists avatar_image text;
alter table public.prokicks_profiles add column if not exists created_at timestamptz not null default now();
alter table public.prokicks_profiles add column if not exists updated_at timestamptz not null default now();
create index if not exists prokicks_profiles_email_idx on public.prokicks_profiles (email);
create index if not exists prokicks_profiles_created_at_idx on public.prokicks_profiles (created_at desc);

create table if not exists public.prokicks_spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  address text,
  city text,
  state text,
  lat numeric,
  lng numeric,
  maps_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.prokicks_spots add column if not exists code text;
alter table public.prokicks_spots add column if not exists address text;
alter table public.prokicks_spots add column if not exists city text;
alter table public.prokicks_spots add column if not exists state text;
alter table public.prokicks_spots add column if not exists lat numeric;
alter table public.prokicks_spots add column if not exists lng numeric;
alter table public.prokicks_spots add column if not exists maps_url text;
alter table public.prokicks_spots add column if not exists active boolean not null default true;
alter table public.prokicks_spots add column if not exists created_at timestamptz not null default now();
create unique index if not exists prokicks_spots_code_uidx on public.prokicks_spots (code);

create table if not exists public.prokicks_challenges (
  id uuid primary key default gen_random_uuid(),
  title text,
  spot_id uuid,
  spot_code text,
  spot_name text,
  creator_name text,
  creator_nickname text,
  creator_avatar_id text,
  type text,
  level text,
  scheduled_at timestamptz,
  status text not null default 'abierta',
  created_at timestamptz not null default now()
);

alter table public.prokicks_challenges add column if not exists title text;
alter table public.prokicks_challenges add column if not exists spot_id uuid;
alter table public.prokicks_challenges add column if not exists spot_code text;
alter table public.prokicks_challenges add column if not exists spot_name text;
alter table public.prokicks_challenges add column if not exists creator_name text;
alter table public.prokicks_challenges add column if not exists creator_nickname text;
alter table public.prokicks_challenges add column if not exists creator_avatar_id text;
alter table public.prokicks_challenges add column if not exists creator_avatar_image text;
alter table public.prokicks_challenges add column if not exists type text;
alter table public.prokicks_challenges add column if not exists level text;
alter table public.prokicks_challenges add column if not exists scheduled_at timestamptz;
alter table public.prokicks_challenges add column if not exists status text not null default 'abierta';
alter table public.prokicks_challenges add column if not exists created_at timestamptz not null default now();
create index if not exists prokicks_challenges_created_at_idx on public.prokicks_challenges (created_at desc);
create index if not exists prokicks_challenges_spot_code_idx on public.prokicks_challenges (spot_code);

insert into public.prokicks_spots (id, name, code, address, city, state, maps_url, active)
values
  ('11111111-1111-1111-1111-111111111111', 'Indoor Community', 'PK-INDOOR-001', 'Av. Toluca 481, LM4, Olivar de los Padres, Álvaro Obregón, 01780 Ciudad de México, CDMX', 'CDMX', 'Ciudad de México', 'https://www.google.com/maps/search/?api=1&query=Av.%20Toluca%20481%20LM4%20Olivar%20de%20los%20Padres%20Alvaro%20Obregon%2001780%20Ciudad%20de%20Mexico%20CDMX', true),
  ('22222222-2222-2222-2222-222222222222', 'Sta. Cruz Atoyac / División del Norte', 'PK-ATOYAC-001', 'Avenida División del Norte y Calle Doctor José María Vértiz, Sta. Cruz Atoyac, Benito Juárez, 03310 CDMX', 'CDMX', 'Ciudad de México', 'https://www.google.com/maps/search/?api=1&query=Avenida%20Division%20del%20Norte%20y%20Calle%20Doctor%20Jose%20Maria%20Vertiz%20Sta.%20Cruz%20Atoyac%20Benito%20Juarez%2003310%20CDMX', true)
on conflict (id) do update set
  name = excluded.name,
  code = excluded.code,
  address = excluded.address,
  city = excluded.city,
  state = excluded.state,
  maps_url = excluded.maps_url,
  active = excluded.active;

alter table public.prokicks_tournaments add column if not exists venue text;
alter table public.prokicks_tournaments add column if not exists address text;
alter table public.prokicks_tournaments add column if not exists maps_url text;
alter table public.prokicks_tournaments add column if not exists rules text;

insert into public.prokicks_tournaments (title, description, city, state, format, level, status, starts_at, capacity, is_free, cost, currency, venue, address, maps_url, rules)
select
  'Indoor Community',
  'Torneo ProKicks en Indoor Community. Registro abierto para individual, dupla y menor con tutor.',
  'CDMX',
  'Ciudad de México',
  'Individual / Dupla',
  'abierto',
  'open',
  '2026-07-17 18:00:00-06'::timestamptz,
  32,
  true,
  0,
  'MXN',
  'Indoor Community',
  'Av. Toluca 481, LM4, Olivar de los Padres, Álvaro Obregón, 01780 Ciudad de México, CDMX',
  'https://www.google.com/maps/search/?api=1&query=Av.%20Toluca%20481%20LM4%20Olivar%20de%20los%20Padres%20Alvaro%20Obregon%2001780%20Ciudad%20de%20Mexico%20CDMX',
  'Registro sin costo. Cupo limitado. Modalidad individual, dupla y menor con tutor disponibles.'
where exists (
  select 1 from information_schema.tables where table_schema = 'public' and table_name = 'prokicks_tournaments'
) and not exists (
  select 1 from public.prokicks_tournaments where title = 'Indoor Community'
);

alter table public.prokicks_profiles enable row level security;
alter table public.prokicks_spots enable row level security;
alter table public.prokicks_challenges enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'prokicks_profiles' and policyname = 'prokicks_profiles_demo_select') then
    create policy prokicks_profiles_demo_select on public.prokicks_profiles for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'prokicks_profiles' and policyname = 'prokicks_profiles_demo_insert') then
    create policy prokicks_profiles_demo_insert on public.prokicks_profiles for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'prokicks_spots' and policyname = 'prokicks_spots_public_select') then
    create policy prokicks_spots_public_select on public.prokicks_spots for select using (active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'prokicks_challenges' and policyname = 'prokicks_challenges_demo_select') then
    create policy prokicks_challenges_demo_select on public.prokicks_challenges for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'prokicks_challenges' and policyname = 'prokicks_challenges_demo_insert') then
    create policy prokicks_challenges_demo_insert on public.prokicks_challenges for insert with check (true);
  end if;
end $$;
