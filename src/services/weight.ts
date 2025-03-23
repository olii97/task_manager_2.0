import { supabase } from "@/integrations/supabase/client";
import { WeightEntry } from "@/types/weight";

export const fetchWeightEntries = async (userId: string): Promise<WeightEntry[]> => {
  const { data, error } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const addWeightEntry = async (userId: string, entry: { weight: number, body_feeling?: string, feeling_note?: string }): Promise<WeightEntry> => {
  const { data, error } = await supabase
    .from("weight_entries")
    .insert([{ ...entry, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateWeightEntry = async (entryId: string, updates: Partial<WeightEntry>): Promise<WeightEntry> => {
  const { data, error } = await supabase
    .from("weight_entries")
    .update(updates)
    .eq("id", entryId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteWeightEntry = async (entryId: string): Promise<void> => {
  const { error } = await supabase
    .from("weight_entries")
    .delete()
    .eq("id", entryId);

  if (error) throw error;
}; 