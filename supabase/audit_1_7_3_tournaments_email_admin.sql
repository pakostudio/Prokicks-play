-- Audit 1.7.3 - Torneos y metadata publica
-- Seguro: add column if not exists + upsert por id fijo. No borra datos.

alter table public.prokicks_tournaments add column if not exists venue text;
alter table public.prokicks_tournaments add column if not exists address text;
alter table public.prokicks_tournaments add column if not exists maps_url text;
alter table public.prokicks_tournaments add column if not exists flyer_url text;
alter table public.prokicks_tournaments add column if not exists pdf_url text;
alter table public.prokicks_tournaments add column if not exists ends_at timestamptz;
alter table public.prokicks_tournaments add column if not exists payment_method text;
alter table public.prokicks_tournaments add column if not exists rules text;

insert into public.prokicks_tournaments (
  id, title, description, city, state, venue, address, maps_url, starts_at, ends_at,
  capacity, is_free, cost, currency, payment_method, rules, status, format, level,
  flyer_url, pdf_url
)
values
  (
    '55555555-5555-4555-8555-555555555555'::uuid,
    '1er Torneo La Barra',
    'Torneo ProKicks 1v1 en La Barra 88.',
    'CDMX',
    'Ciudad de México',
    'La Barra 88',
    'Calz. de la Ronda 99-loc.b, Ex Hipódromo de Peralvillo, Cuauhtémoc, 06250 Ciudad de México, CDMX',
    'https://www.google.com/maps/search/?api=1&query=Calz.%20de%20la%20Ronda%2099-loc.b%20Ex%20Hipodromo%20de%20Peralvillo%20Cuauhtemoc%2006250%20Ciudad%20de%20Mexico%20CDMX',
    '2026-07-05 10:00:00-06'::timestamptz,
    null,
    32,
    true,
    0,
    'MXN',
    'sin_costo',
    'Formato 1v1. Cupo limitado. Participantes deben aceptar reglamento y uso de imagen.',
    'open',
    '1v1',
    'abierto',
    '/tournaments/torneo-la-barra-2026.jpeg',
    null
  ),
  (
    '66666666-6666-4666-8666-666666666666'::uuid,
    'Indoor Community',
    'Torneo ProKicks 1v1 en Indoor Community.',
    'CDMX',
    'Ciudad de México',
    'Indoor Community',
    'Av. Toluca 481, Olivar de los Padres, Álvaro Obregón, 01780 Ciudad de México, CDMX',
    'https://www.google.com/maps/search/?api=1&query=Av.%20Toluca%20481%20Olivar%20de%20los%20Padres%20Alvaro%20Obregon%2001780%20Ciudad%20de%20Mexico%20CDMX',
    '2026-07-27 10:00:00-06'::timestamptz,
    null,
    32,
    true,
    0,
    'MXN',
    'sin_costo',
    'Formato 1v1. Cupo limitado. Participantes deben aceptar reglamento y uso de imagen.',
    'open',
    '1v1',
    'abierto',
    '/tournaments/torneo-inaugural-prokicks-2026.png',
    '/docs/torneo-inaugural-prokicks-2026.pdf'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  city = excluded.city,
  state = excluded.state,
  venue = excluded.venue,
  address = excluded.address,
  maps_url = excluded.maps_url,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  capacity = excluded.capacity,
  is_free = excluded.is_free,
  cost = excluded.cost,
  currency = excluded.currency,
  payment_method = excluded.payment_method,
  rules = excluded.rules,
  status = excluded.status,
  format = excluded.format,
  level = excluded.level,
  flyer_url = excluded.flyer_url,
  pdf_url = excluded.pdf_url;
