
import { supabase } from "@/integrations/supabase/client";
import { WeightEntry, TimeRange, WeightStats, BodyFeeling } from "@/types/weight";
import { format, subDays, parseISO } from "date-fns";

export async function logWeight(
  userId: string, 
  weight: number, 
  bodyFeeling?: BodyFeeling | null, 
  feelingNote?: string | null
): Promise<WeightEntry | null> {
  try {
    const { data, error } = await supabase
      .from('weight_entries')
      .insert({
        user_id: userId,
        weight,
        body_feeling: bodyFeeling || null,
        feeling_note: feelingNote || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging weight:', error);
      return null;
    }

    return data as WeightEntry;
  } catch (error) {
    console.error('Exception logging weight:', error);
    return null;
  }
}

export async function getWeightEntries(userId: string, timeRange?: TimeRange): Promise<WeightEntry[]> {
  try {
    let query = supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (timeRange && timeRange !== 'all') {
      const days = parseInt(timeRange.replace('days', ''));
      const cutoffDate = subDays(new Date(), days).toISOString();
      query = query.gte('created_at', cutoffDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching weight entries:', error);
      return [];
    }

    return data as WeightEntry[];
  } catch (error) {
    console.error('Exception fetching weight entries:', error);
    return [];
  }
}

export async function getLatestWeightEntry(userId: string): Promise<WeightEntry | null> {
  try {
    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching latest weight entry:', error);
      return null;
    }

    return data as WeightEntry;
  } catch (error) {
    console.error('Exception fetching latest weight entry:', error);
    return null;
  }
}

export async function deleteWeightEntry(entryId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('weight_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('Error deleting weight entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting weight entry:', error);
    return false;
  }
}

export function calculateWeightStats(entries: WeightEntry[], period: string): WeightStats {
  if (!entries || entries.length === 0) {
    return {
      current: null,
      previous: null,
      change: null,
      changePercentage: null,
      period
    };
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const current = sortedEntries[0].weight;
  
  // If we only have one entry, we can't calculate change
  if (sortedEntries.length === 1) {
    return {
      current,
      previous: null,
      change: null,
      changePercentage: null,
      period
    };
  }

  const previous = sortedEntries[sortedEntries.length - 1].weight;
  const change = current - previous;
  const changePercentage = (change / previous) * 100;

  return {
    current,
    previous,
    change,
    changePercentage,
    period
  };
}
