
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
