-- PROKICKS PLAY · SPRINT 1 CORE PLAY LOOP
-- Ejecutar en Supabase SQL Editor.

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  alias text unique,
  city text default 'CDMX',
  level text default 'principiante' check (level in ('principiante','intermedio','avanzado')),
  xp integer default 0,
  wins integer default 0,
  losses integer default 0,
  role text default 'player' check (role in ('player','leader','organizer','admin')),
  created_at timestamptz default now()
);

create table if not exists public.spots (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text not null default 'CDMX',
  address text,
  lat numeric,
  lng numeric,
  status text default 'active' check (status in ('active','inactive','maintenance')),
  activity_score integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.devices (
  id uuid primary key default uuid_generate_v4(),
  spot_id uuid references public.spots(id) on delete cascade,
  name text not null,
  qr_code text not null unique,
  status text default 'active' check (status in ('active','inactive','maintenance')),
  last_seen_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.challenges (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  creator_id uuid references public.profiles(id) on delete set null,
  spot_id uuid references public.spots(id) on delete cascade,
  type text default '1v1' check (type in ('1v1','2v2','3v3')),
  level text default 'intermedio' check (level in ('principiante','intermedio','avanzado')),
  status text default 'open' check (status in ('open','full','playing','finished','cancelled')),
  scheduled_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.challenge_participants (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references public.challenges(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  team text default 'A' check (team in ('A','B')),
  created_at timestamptz default now(),
  unique(challenge_id, user_id)
);

create table if not exists public.results (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references public.challenges(id) on delete cascade,
  team_a_score integer not null default 0,
  team_b_score integer not null default 0,
  winner_team text check (winner_team in ('A','B')),
  validated boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.spots enable row level security;
alter table public.devices enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.results enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select using (true);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "spots_select" on public.spots;
create policy "spots_select" on public.spots for select using (true);

drop policy if exists "devices_select" on public.devices;
create policy "devices_select" on public.devices for select using (true);

drop policy if exists "challenges_select" on public.challenges;
create policy "challenges_select" on public.challenges for select using (true);

drop policy if exists "challenges_insert_auth" on public.challenges;
create policy "challenges_insert_auth" on public.challenges for insert with check (auth.uid() is not null);

drop policy if exists "participants_select" on public.challenge_participants;
create policy "participants_select" on public.challenge_participants for select using (true);

drop policy if exists "participants_insert_auth" on public.challenge_participants;
create policy "participants_insert_auth" on public.challenge_participants for insert with check (auth.uid() is not null);

drop policy if exists "results_select" on public.results;
create policy "results_select" on public.results for select using (true);

drop policy if exists "results_insert_auth" on public.results;
create policy "results_insert_auth" on public.results for insert with check (auth.uid() is not null);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, alias)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
