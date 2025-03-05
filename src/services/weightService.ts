
import { supabase } from "@/integrations/supabase/client";
import { WeightEntry } from "@/types/weight";

export async function fetchWeightEntries(userId: string): Promise<WeightEntry[]> {
  const { data, error } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching weight entries:", error);
    throw error;
  }

  return data as WeightEntry[];
}

export async function fetchLatestWeightEntry(userId: string): Promise<WeightEntry | null> {
  const { data, error } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching latest weight entry:", error);
    throw error;
  }

  return data as WeightEntry | null;
}

export async function addWeightEntry(userId: string, weight: number): Promise<WeightEntry> {
  const { data, error } = await supabase
    .from("weight_entries")
    .insert([
      { user_id: userId, weight }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding weight entry:", error);
    throw error;
  }

  return data as WeightEntry;
}

export async function updateBodyFeeling(
  entryId: string, 
  body_feeling: string, 
  feeling_note?: string
): Promise<WeightEntry> {
  const { data, error } = await supabase
    .from("weight_entries")
    .update({ 
      body_feeling, 
      feeling_note: feeling_note || null 
    })
    .eq("id", entryId)
    .select()
    .single();

  if (error) {
    console.error("Error updating body feeling:", error);
    throw error;
  }

  return data as WeightEntry;
}

export async function deleteWeightEntry(entryId: string): Promise<void> {
  const { error } = await supabase
    .from("weight_entries")
    .delete()
    .eq("id", entryId);

  if (error) {
    console.error("Error deleting weight entry:", error);
    throw error;
  }
}
