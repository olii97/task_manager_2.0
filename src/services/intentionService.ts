
import { supabase } from "@/integrations/supabase/client";
import { WeeklyIntention, mapDatabaseToWeeklyIntention, getCurrentWeekStart } from "@/types/intentions";

export const getCurrentWeekIntentions = async (userId: string): Promise<WeeklyIntention | null> => {
  const weekStart = getCurrentWeekStart();
  
  const { data, error } = await supabase
    .from("weekly_intentions")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching current week intentions:", error);
    throw error;
  }
  
  return data ? mapDatabaseToWeeklyIntention(data) : null;
};

export const getAllWeeklyIntentions = async (userId: string): Promise<WeeklyIntention[]> => {
  const { data, error } = await supabase
    .from("weekly_intentions")
    .select("*")
    .eq("user_id", userId)
    .order("week_start", { ascending: false });
  
  if (error) {
    console.error("Error fetching all weekly intentions:", error);
    throw error;
  }
  
  return data.map(mapDatabaseToWeeklyIntention);
};

export const createWeeklyIntention = async (userId: string, intention: Partial<WeeklyIntention>): Promise<WeeklyIntention> => {
  const weekStart = getCurrentWeekStart();
  
  const { data, error } = await supabase
    .from("weekly_intentions")
    .insert({
      user_id: userId,
      week_start: weekStart,
      intention_1: intention.intention_1 || null,
      intention_2: intention.intention_2 || null,
      intention_3: intention.intention_3 || null,
      status: 'active'
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating weekly intention:", error);
    throw error;
  }
  
  return mapDatabaseToWeeklyIntention(data);
};

export const updateWeeklyIntention = async (intentionId: string, updates: Partial<WeeklyIntention>): Promise<WeeklyIntention> => {
  const { data, error } = await supabase
    .from("weekly_intentions")
    .update({
      intention_1: updates.intention_1,
      intention_2: updates.intention_2,
      intention_3: updates.intention_3,
      reflection_1: updates.reflection_1,
      reflection_2: updates.reflection_2,
      reflection_3: updates.reflection_3,
      status: updates.status
    })
    .eq("id", intentionId)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating weekly intention:", error);
    throw error;
  }
  
  return mapDatabaseToWeeklyIntention(data);
};
