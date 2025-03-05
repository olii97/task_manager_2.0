
export type BodyFeeling = 'Sore' | 'Relaxed' | 'Energized' | 'Stressed' | 'Tired' | 'Other';

export interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  created_at: string;
  updated_at: string;
  body_feeling: BodyFeeling | null;
  feeling_note: string | null;
}

export type TimeRange = '7days' | '14days' | '30days' | 'all';

export interface WeightStats {
  current: number | null;
  previous: number | null;
  change: number | null;
  changePercentage: number | null;
  period: string;
}
