-- Sprint 1.7.2 - QA / Presentacion hotfix
-- Seguro: no borra datos, solo agrega columnas opcionales y upsert de spots reales.

create extension if not exists pgcrypto;

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
alter table public.prokicks_spots add column if not exists maps_url text;
alter table public.prokicks_spots add column if not exists active boolean not null default true;
create unique index if not exists prokicks_spots_code_uidx on public.prokicks_spots (code);

alter table public.prokicks_profiles add column if not exists avatar_image text;
alter table public.prokicks_challenges add column if not exists creator_avatar_image text;

insert into public.prokicks_spots (id, name, code, address, city, state, maps_url, active)
values
  ('11111111-1111-1111-1111-111111111111', 'Indoor Community', 'PK-INDOOR-001', 'Av. Toluca 481, LM4, Olivar de los Padres, Álvaro Obregón, 01780 Ciudad de México, CDMX', 'CDMX', 'Ciudad de México', 'https://www.google.com/maps/search/?api=1&query=Av.%20Toluca%20481%20LM4%20Olivar%20de%20los%20Padres%20Alvaro%20Obregon%2001780%20Ciudad%20de%20Mexico%20CDMX', true),
  ('22222222-2222-2222-2222-222222222222', 'Sta. Cruz Atoyac / División del Norte', 'PK-ATOYAC-001', 'Avenida División del Norte y Calle Doctor José María Vértiz, Sta. Cruz Atoyac, Benito Juárez, 03310 CDMX', 'CDMX', 'Ciudad de México', 'https://www.google.com/maps/search/?api=1&query=Avenida%20Division%20del%20Norte%20y%20Calle%20Doctor%20Jose%20Maria%20Vertiz%20Sta.%20Cruz%20Atoyac%20Benito%20Juarez%2003310%20CDMX', true),
  ('33333333-3333-3333-3333-333333333333', 'Parque de los Venados', 'PK-VENADOS-001', 'Av. División del Norte, Dr. José María Vértiz, Sta. Cruz Atoyac, 03310 CDMX', 'CDMX', 'Ciudad de México', 'https://www.google.com/maps/search/?api=1&query=Av.%20Division%20del%20Norte%20Dr.%20Jose%20Maria%20Vertiz%20Sta.%20Cruz%20Atoyac%2003310%20CDMX', true),
  ('44444444-4444-4444-4444-444444444444', 'Tlatelolco', 'PK-TLATELOLCO-001', 'Eje Central Lázaro Cárdenas s/n, Tlatelolco, Cuauhtémoc, CDMX', 'CDMX', 'Ciudad de México', 'https://www.google.com/maps/search/?api=1&query=Eje%20Central%20Lazaro%20Cardenas%20s%2Fn%20Tlatelolco%20Cuauhtemoc%20CDMX', true)
on conflict (id) do update set
  name = excluded.name,
  code = excluded.code,
  address = excluded.address,
  city = excluded.city,
  state = excluded.state,
  maps_url = excluded.maps_url,
  active = excluded.active;
