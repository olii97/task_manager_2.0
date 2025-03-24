export interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  body_feeling?: string;
  feeling_note?: string;
  created_at: string;
  updated_at: string;
}

export interface WeightGoal {
  user_id: string;
  start_date: string;
  start_weight: number;
  target_weight: number;
  target_date?: string;
  created_at: string;
  updated_at: string;
}

export interface WeightStats {
  currentWeight: number;
  weightLost: number;
  trendLine: Record<string, number>;
} 