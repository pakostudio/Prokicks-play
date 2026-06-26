-- PROKICKS PLAY · SPRINT 1.3 · ADMIN EN APP PARA TORNEOS
-- Permite edición desde la app durante MVP/demo. En producción se debe cerrar por role=admin.

alter table public.prokicks_tournaments
add column if not exists updated_at timestamptz default now();

drop policy if exists "prokicks_tournaments_insert_auth" on public.prokicks_tournaments;
drop policy if exists "prokicks_tournaments_insert_demo" on public.prokicks_tournaments;
create policy "prokicks_tournaments_insert_demo"
on public.prokicks_tournaments
for insert
with check (true);

drop policy if exists "prokicks_tournaments_update_demo" on public.prokicks_tournaments;
create policy "prokicks_tournaments_update_demo"
on public.prokicks_tournaments
for update
using (true)
with check (true);

drop policy if exists "prokicks_tournaments_delete_demo" on public.prokicks_tournaments;
create policy "prokicks_tournaments_delete_demo"
on public.prokicks_tournaments
for delete
using (true);

drop policy if exists "prokicks_tournament_registrations_insert_auth" on public.prokicks_tournament_registrations;
drop policy if exists "prokicks_tournament_registrations_insert_demo" on public.prokicks_tournament_registrations;
create policy "prokicks_tournament_registrations_insert_demo"
on public.prokicks_tournament_registrations
for insert
with check (true);

drop policy if exists "prokicks_tournament_registrations_update_demo" on public.prokicks_tournament_registrations;
create policy "prokicks_tournament_registrations_update_demo"
on public.prokicks_tournament_registrations
for update
using (true)
with check (true);

drop policy if exists "prokicks_tournament_registrations_delete_demo" on public.prokicks_tournament_registrations;
create policy "prokicks_tournament_registrations_delete_demo"
on public.prokicks_tournament_registrations
for delete
using (true);
