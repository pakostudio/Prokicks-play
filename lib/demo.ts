export const demoSpots = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'ProKicks Roma Norte', city: 'CDMX', address: 'Roma Norte, CDMX', status: 'active', activity_score: 92 },
  { id: '22222222-2222-2222-2222-222222222222', name: 'ProKicks Polanco', city: 'CDMX', address: 'Polanco, CDMX', status: 'active', activity_score: 78 },
  { id: '33333333-3333-3333-3333-333333333333', name: 'ProKicks Coyoacán', city: 'CDMX', address: 'Coyoacán, CDMX', status: 'maintenance', activity_score: 41 }
];

export const demoChallenges = [
  { id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', title: 'Reta rápida 1v1', spot_id: demoSpots[0].id, spot_name: demoSpots[0].name, type: '1v1', level: 'intermedio', status: 'open', scheduled_at: new Date().toISOString() },
  { id: 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', title: 'Duelo de equipos', spot_id: demoSpots[1].id, spot_name: demoSpots[1].name, type: '2v2', level: 'principiante', status: 'open', scheduled_at: new Date().toISOString() }
];

export const demoRanking = [
  { name: 'Pako', xp: 1280, wins: 14, city: 'CDMX' },
  { name: 'Alex', xp: 1150, wins: 11, city: 'CDMX' },
  { name: 'Mau', xp: 970, wins: 9, city: 'CDMX' },
  { name: 'Fer', xp: 830, wins: 7, city: 'CDMX' }
];
