export const avatarOptions = [
  { id: 'street-striker', name: 'Street Striker', initials: 'SS', tone: 'avatar-red' },
  { id: 'roma-baller', name: 'Roma Baller', initials: 'RB', tone: 'avatar-blue' },
  { id: 'indoor-beast', name: 'Indoor Beast', initials: 'IB', tone: 'avatar-ink' },
  { id: 'freestyle-pk', name: 'Freestyle PK', initials: 'FP', tone: 'avatar-gold' },
  { id: 'reta-master', name: 'Reta Master', initials: 'RM', tone: 'avatar-coral' },
  { id: 'urban-captain', name: 'Urban Captain', initials: 'UC', tone: 'avatar-violet' },
  { id: 'neon-play', name: 'Neon Play', initials: 'NP', tone: 'avatar-lime' },
  { id: 'prokicks-crew', name: 'ProKicks Crew', initials: 'PC', tone: 'avatar-sky' }
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
    activity_score: 96,
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
    activity_score: 88,
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Avenida%20Division%20del%20Norte%20y%20Calle%20Doctor%20Jose%20Maria%20Vertiz%20Sta.%20Cruz%20Atoyac%20Benito%20Juarez%2003310%20CDMX'
  }
];

export const demoSpots = realSpots;

export const demoChallenges = [
  { id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', title: 'Reta abierta Indoor', spot_id: demoSpots[0].id, spot_code: demoSpots[0].code, spot_name: demoSpots[0].name, type: '1v1', level: 'intermedio', status: 'abierta', scheduled_at: new Date().toISOString() },
  { id: 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', title: 'Reta Atoyac 2v2', spot_id: demoSpots[1].id, spot_code: demoSpots[1].code, spot_name: demoSpots[1].name, type: '2v2', level: 'abierto', status: 'abierta', scheduled_at: new Date().toISOString() }
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

export const demoRanking = [
  { name: 'Pako', xp: 1280, wins: 14, city: 'CDMX' },
  { name: 'Alex', xp: 1150, wins: 11, city: 'CDMX' },
  { name: 'Mau', xp: 970, wins: 9, city: 'CDMX' },
  { name: 'Fer', xp: 830, wins: 7, city: 'CDMX' }
];
