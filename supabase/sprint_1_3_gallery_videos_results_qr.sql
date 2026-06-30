-- Sprint 1.3 - Galeria, videos, resultados y bases QR/check-in

create table if not exists public.prokicks_gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  cloudinary_public_id text,
  tournament_id uuid references public.prokicks_tournaments(id) on delete set null,
  category text default 'torneo',
  published boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.prokicks_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  youtube_url text not null,
  youtube_video_id text not null,
  embed_url text not null,
  thumbnail_url text,
  tournament_id uuid references public.prokicks_tournaments(id) on delete set null,
  category text default 'highlight',
  published boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.prokicks_tournament_results (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.prokicks_tournaments(id) on delete cascade,
  position integer not null default 1,
  participant_name text not null,
  team_name text,
  category text default 'libre',
  played integer default 0,
  wins integer default 0,
  losses integer default 0,
  points integer default 0,
  status text default 'participante',
  notes text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.prokicks_tournament_registrations
  add column if not exists check_in_code text,
  add column if not exists check_in_at timestamptz,
  add column if not exists check_in_status text default 'pending',
  add column if not exists checked_in_by text;

update public.prokicks_tournament_registrations
set check_in_code = 'PKC-' || upper(substr(md5(id::text), 1, 10)),
    check_in_status = coalesce(check_in_status, 'pending')
where check_in_code is null;

create unique index if not exists idx_prokicks_registrations_check_in_code
on public.prokicks_tournament_registrations(check_in_code)
where check_in_code is not null;

create index if not exists idx_prokicks_gallery_published on public.prokicks_gallery_items(published, category);
create index if not exists idx_prokicks_gallery_tournament on public.prokicks_gallery_items(tournament_id);
create index if not exists idx_prokicks_videos_published on public.prokicks_videos(published, category);
create index if not exists idx_prokicks_videos_tournament on public.prokicks_videos(tournament_id);
create index if not exists idx_prokicks_results_tournament on public.prokicks_tournament_results(tournament_id, published, position);

alter table public.prokicks_gallery_items enable row level security;
alter table public.prokicks_videos enable row level security;
alter table public.prokicks_tournament_results enable row level security;

drop policy if exists "prokicks_gallery_public_select" on public.prokicks_gallery_items;
create policy "prokicks_gallery_public_select" on public.prokicks_gallery_items for select using (true);
drop policy if exists "prokicks_gallery_public_write" on public.prokicks_gallery_items;
create policy "prokicks_gallery_public_write" on public.prokicks_gallery_items for all using (true) with check (true);

drop policy if exists "prokicks_videos_public_select" on public.prokicks_videos;
create policy "prokicks_videos_public_select" on public.prokicks_videos for select using (true);
drop policy if exists "prokicks_videos_public_write" on public.prokicks_videos;
create policy "prokicks_videos_public_write" on public.prokicks_videos for all using (true) with check (true);

drop policy if exists "prokicks_results_public_select" on public.prokicks_tournament_results;
create policy "prokicks_results_public_select" on public.prokicks_tournament_results for select using (true);
drop policy if exists "prokicks_results_public_write" on public.prokicks_tournament_results;
create policy "prokicks_results_public_write" on public.prokicks_tournament_results for all using (true) with check (true);
