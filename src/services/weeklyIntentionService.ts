
import { supabase } from "@/integrations/supabase/client";
import { mapDatabaseIntentionToWeeklyIntention, WeeklyIntention, WeeklyIntentionFormData, WeeklyReflectionFormData } from "@/types/weeklyIntentions";
import { startOfWeek, format } from "date-fns";

export async function getCurrentWeekIntentions(userId: string): Promise<WeeklyIntention | null> {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday as week start
  const formattedWeekStart = format(weekStart, "yyyy-MM-dd");
  
  try {
    const { data, error } = await supabase
      .from("weekly_intentions")
      .select("*")
      .eq("user_id", userId)
      .eq("week_start", formattedWeekStart)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching weekly intentions:", error);
      throw error;
    }
    
    return data ? mapDatabaseIntentionToWeeklyIntention(data) : null;
  } catch (error) {
    console.error("Error in getCurrentWeekIntentions:", error);
    return null; // Return null instead of throwing to prevent app crashes
  }
}

export async function createWeeklyIntentions(
  userId: string,
  formData: WeeklyIntentionFormData
): Promise<WeeklyIntention | null> {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const formattedWeekStart = format(weekStart, "yyyy-MM-dd");
  
  try {
    const { data, error } = await supabase
      .from("weekly_intentions")
      .insert({
        user_id: userId,
        week_start: formattedWeekStart,
        intention_1: formData.intention_1,
        intention_2: formData.intention_2,
        intention_3: formData.intention_3,
        status: "active"
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating weekly intentions:", error);
      throw error;
    }
    
    return mapDatabaseIntentionToWeeklyIntention(data);
  } catch (error) {
    console.error("Error in createWeeklyIntentions:", error);
    return null; // Return null instead of throwing to prevent app crashes
  }
}

export async function updateWeeklyIntentions(
  intentionId: string,
  formData: WeeklyIntentionFormData
): Promise<WeeklyIntention | null> {
  try {
    const { data, error } = await supabase
      .from("weekly_intentions")
      .update({
        intention_1: formData.intention_1,
        intention_2: formData.intention_2,
        intention_3: formData.intention_3,
      })
      .eq("id", intentionId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating weekly intentions:", error);
      throw error;
    }
    
    return mapDatabaseIntentionToWeeklyIntention(data);
  } catch (error) {
    console.error("Error in updateWeeklyIntentions:", error);
    return null; // Return null instead of throwing to prevent app crashes
  }
}

export async function submitWeeklyReflections(
  intentionId: string,
  reflections: WeeklyReflectionFormData
): Promise<WeeklyIntention | null> {
  try {
    const { data, error } = await supabase
      .from("weekly_intentions")
      .update({
        reflection_1: reflections.reflection_1,
        reflection_2: reflections.reflection_2,
        reflection_3: reflections.reflection_3,
        status: "reviewed"
      })
      .eq("id", intentionId)
      .select()
      .single();
    
    if (error) {
      console.error("Error submitting reflections:", error);
      throw error;
    }
    
    return mapDatabaseIntentionToWeeklyIntention(data);
  } catch (error) {
    console.error("Error in submitWeeklyReflections:", error);
    return null; // Return null instead of throwing to prevent app crashes
  }
}

export async function canEditIntentions(): Promise<boolean> {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Return true if it's Monday, Tuesday, or Wednesday (0 = Sunday, 1 = Monday, etc.)
    // For testing purposes, we're allowing edits throughout the week
    return true; // Change to: return dayOfWeek >= 1 && dayOfWeek <= 3; for production
  } catch (error) {
    console.error("Error in canEditIntentions:", error);
    return true; // Default to allowing edits if there's an error
  }
}

export async function shouldShowReflection(): Promise<boolean> {
  try {
    // For testing purposes, we're always showing the reflection button
    return true; // Change to: return new Date().getDay() === 0; for production (Sunday only)
  } catch (error) {
    console.error("Error in shouldShowReflection:", error);
    return true; // Default to showing reflection if there's an error
  }
}
