import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NewCalendarEntry } from "./calendarService";

/**
 * Analyzes calendar text using a Supabase Edge Function (server-side)
 * This provides a more secure alternative to direct OpenAI API calls from the client
 */
export const analyzeCalendarTextServer = async (calendarText: string): Promise<NewCalendarEntry> => {
  try {
    console.log("Calling Supabase Edge Function for calendar analysis");
    
    const { data, error } = await supabase.functions.invoke('analyze-calendar-text', {
      body: { text: calendarText }
    });

    if (error) {
      console.error("Supabase Edge Function error:", error);
      throw new Error(`Error from server: ${error.message}`);
    }

    console.log("Edge function response:", data);
    
    if (!data || !data.title) {
      throw new Error("Invalid response from server");
    }

    // Ensure we have all required fields with defaults if needed
    const result: NewCalendarEntry = {
      title: data.title,
      description: data.description || "",
      date: data.date || new Date().toISOString().split('T')[0], // Default to today
      entry_type: (data.entry_type === 'work' || data.entry_type === 'personal') 
        ? data.entry_type 
        : 'personal', // Default to personal
      status: 'pending',
      is_recurring: !!data.is_recurring,
      recurrence_pattern: data.is_recurring ? (data.recurrence_pattern || 'weekly') : undefined,
    };

    return result;
  } catch (error) {
    console.error("Error in server calendar analysis:", error);
    toast({
      title: "Server Error",
      description: "Failed to analyze calendar text. Please try again or create manually.",
      variant: "destructive",
    });
    throw error;
  }
}; 