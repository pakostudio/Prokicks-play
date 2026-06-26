export type Spot = {
  id: string;
  name: string;
  city: string;
  address: string;
  status: 'active' | 'inactive' | 'maintenance';
  activity_score: number;
};

export type Challenge = {
  id: string;
  title: string;
  spot_id: string;
  spot_name?: string;
  type: '1v1' | '2v2' | '3v3';
  level: 'principiante' | 'intermedio' | 'avanzado';
  status: 'open' | 'full' | 'playing' | 'finished' | 'cancelled';
  scheduled_at: string;
};
