
import { Json } from "@/integrations/supabase/types";

export interface JournalNutrition {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snacks?: string;
  water?: number;
  meals?: string;
  protein?: boolean;
  calories?: number;
  feelings?: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  mood: number;
  energy: number;
  reflection: string | null;
  challenges: string | null;
  intentions: string | null;
  gratitude: string | null;
  nutrition: JournalNutrition | null;
  created_at: string;
  updated_at: string;
}

export const mapDatabaseEntryToJournalEntry = (dbEntry: any): JournalEntry => {
  return {
    ...dbEntry,
    nutrition: dbEntry.nutrition as JournalNutrition | null,
  };
};

export const MoodOptions = ["😔", "😐", "🙂", "😊", "😃"] as const;
export const EnergyOptions = ["Very Low", "Low", "Moderate", "High", "Very High"] as const;

export const getMoodEmoji = (moodValue: number): string => {
  // Ensure the mood value is between 1-5
  const sanitizedMood = Math.min(Math.max(Math.round(moodValue), 1), 5);
  return MoodOptions[sanitizedMood - 1];
};

export const getEnergyLabel = (energyValue: number): string => {
  // Ensure the energy value is between 1-5
  const sanitizedEnergy = Math.min(Math.max(Math.round(energyValue), 1), 5);
  return EnergyOptions[sanitizedEnergy - 1];
};

// Convert slider value (0-100) to mood/energy scale (1-5)
export const sliderToScale = (sliderValue: number): number => {
  return Math.ceil((sliderValue / 100) * 5);
};

// Convert mood/energy scale (1-5) to slider value (0-100)
export const scaleToSlider = (scaleValue: number): number => {
  return ((scaleValue - 1) / 4) * 100;
};
