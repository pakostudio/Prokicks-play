export const avatarOptions = [
  { id: 'street-striker', name: 'Street Striker', image: '/avatars/street-striker.png' },
  { id: 'roma-baller', name: 'Roma Baller', image: '/avatars/roma-baller.png' },
  { id: 'indoor-beast', name: 'Indoor Beast', image: '/avatars/indoor-beast.png' },
  { id: 'freestyle-pk', name: 'Freestyle PK', image: '/avatars/freestyle-pk.png' },
  { id: 'reta-master', name: 'Reta Master', image: '/avatars/reta-master.png' },
  { id: 'urban-captain', name: 'Urban Captain', image: '/avatars/urban-captain.png' },
  { id: 'neon-play', name: 'Neon Play', image: '/avatars/neon-play.png' },
  { id: 'prokicks-crew', name: 'ProKicks Crew', image: '/avatars/prokicks-crew.png' },
  { id: 'street-pup', name: 'Street Pup', image: '/avatars/street-pup.png' },
  { id: 'barrio-pup', name: 'Barrio Pup', image: '/avatars/barrio-pup.png' },
  { id: 'kitty-baller', name: 'Kitty Baller', image: '/avatars/kitty-baller.png' },
  { id: 'neon-kitty', name: 'Neon Kitty', image: '/avatars/neon-kitty.png' }
];

export const realSpots = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Indoor Community',
    code: 'PK-INDOOR-001',
    city: 'CDMX',
    state: 'Ciudad de México',
    address: 'Av. Toluca 481, LM4, Olivar de los Padres, Álvaro Obregón, 01780 Ciudad de México, CDMX',
    status: 'Activo',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Av.%20Toluca%20481%20LM4%20Olivar%20de%20los%20Padres%20Alvaro%20Obregon%2001780%20Ciudad%20de%20Mexico%20CDMX'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Sta. Cruz Atoyac / División del Norte',
    code: 'PK-ATOYAC-001',
    city: 'CDMX',
    state: 'Ciudad de México',
    address: 'Avenida División del Norte y Calle Doctor José María Vértiz, Sta. Cruz Atoyac, Benito Juárez, 03310 CDMX',
    status: 'Activo',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Avenida%20Division%20del%20Norte%20y%20Calle%20Doctor%20Jose%20Maria%20Vertiz%20Sta.%20Cruz%20Atoyac%20Benito%20Juarez%2003310%20CDMX'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Parque de los Venados',
    code: 'PK-VENADOS-001',
    city: 'CDMX',
    state: 'Ciudad de México',
    address: 'Av. División del Norte, Dr. José María Vértiz, Sta. Cruz Atoyac, 03310 CDMX',
    status: 'Activo',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Av.%20Division%20del%20Norte%20Dr.%20Jose%20Maria%20Vertiz%20Sta.%20Cruz%20Atoyac%2003310%20CDMX'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Tlatelolco',
    code: 'PK-TLATELOLCO-001',
    city: 'CDMX',
    state: 'Ciudad de México',
    address: 'Eje Central Lázaro Cárdenas s/n, Tlatelolco, Cuauhtémoc, CDMX',
    status: 'Activo',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Eje%20Central%20Lazaro%20Cardenas%20s%2Fn%20Tlatelolco%20Cuauhtemoc%20CDMX'
  }
];

export const indoorTournament = {
  id: 'indoor-community-2026-07-17',
  title: 'Indoor Community',
  description: 'Torneo ProKicks en Indoor Community. Registro abierto para individual, dupla y menor con tutor.',
  city: 'CDMX',
  state: 'Ciudad de México',
  venue: 'Indoor Community',
  address: realSpots[0].address,
  maps_url: realSpots[0].maps_url,
  starts_at: '2026-07-17T18:00:00-06:00',
  status: 'open',
  format: 'Individual / Dupla',
  level: 'abierto',
  capacity: 32,
  is_free: true,
  cost: 0,
  currency: 'MXN'
};

export function findSpotByCode(code: string) {
  return realSpots.find((spot) => spot.code.toUpperCase() === code.trim().toUpperCase()) || null;
}

export function mapEmbedUrl(address: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}
