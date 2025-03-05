
export interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  body_feeling: string | null;
  feeling_note: string | null;
  created_at: string;
  updated_at: string;
}

export type BodyFeeling = "Sore" | "Relaxed" | "Energized" | "Stressed" | "Tired" | "Other";

export const bodyFeelingEmoji: Record<BodyFeeling, string> = {
  "Sore": "🤕",
  "Relaxed": "😌",
  "Energized": "⚡",
  "Stressed": "😰",
  "Tired": "😴",
  "Other": "🤔"
};
