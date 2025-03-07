
import { supabase } from "@/integrations/supabase/client";
import { WrapUpData, WrapUpResponse } from "@/types/wrapup";

/**
 * Processes the wrap-up survey for a day and stores the results
 */
export const submitWrapUpSurvey = async (
  userId: string,
  data: WrapUpData
): Promise<WrapUpResponse> => {
  try {
    // Validate user ID
    if (!userId) {
      return {
        success: false,
        error: "User ID is required",
      };
    }

    // Format date to YYYY-MM-DD
    const wrapupDate = new Date().toISOString().split("T")[0];

    // Check if a wrapup already exists for this date
    const { data: existingWrapup, error: checkError } = await supabase
      .from("daily_wrapup")
      .select("*")
      .eq("user_id", userId)
      .eq("date", wrapupDate)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing wrapup:", checkError);
      return {
        success: false,
        error: "Failed to check for existing wrap-up",
      };
    }

    let response;

    if (existingWrapup) {
      // Update existing wrapup
      response = await supabase
        .from("daily_wrapup")
        .update({
          productivity_rating: data.productivityRating,
          energy_rating: data.energyRating,
          focus_rating: data.focusRating,
          completed_tasks_count: data.completedTasksCount,
          uncompleted_tasks_count: data.uncompletedTasksCount,
          high_priority_completed: data.highPriorityCompleted,
          reflections: data.reflections,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingWrapup.id);
    } else {
      // Insert new wrapup
      response = await supabase.from("daily_wrapup").insert([
        {
          user_id: userId,
          date: wrapupDate,
          productivity_rating: data.productivityRating,
          energy_rating: data.energyRating,
          focus_rating: data.focusRating,
          completed_tasks_count: data.completedTasksCount,
          uncompleted_tasks_count: data.uncompletedTasksCount,
          high_priority_completed: data.highPriorityCompleted,
          reflections: data.reflections,
        },
      ]);
    }

    if (response.error) {
      console.error("Error storing wrapup data:", response.error);
      return {
        success: false,
        error: "Failed to store wrap-up data",
      };
    }

    // If we have journal data, update today's journal entry
    if (data.journalContent) {
      const journalDate = new Date().toISOString().split("T")[0];

      // Check if a journal entry exists for today
      const { data: journalEntry, error: journalCheckError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("date", journalDate)
        .maybeSingle();

      if (journalCheckError) {
        console.error("Error checking existing journal:", journalCheckError);
        // Don't fail the entire process for this secondary operation
      } else {
        // Add reflection to journal
        const reflectionTimestamp = new Date().toISOString();
        
        // Make sure reflection content is a string
        const reflectionContent = String(data.journalContent || "");
        
        if (journalEntry) {
          // Update existing journal entry - add to reflections array
          const existingReflections = journalEntry.reflections || [];
          
          const { error: journalUpdateError } = await supabase
            .from("journal_entries")
            .update({
              reflection: reflectionContent, // Main reflection field
              reflections: [
                ...existingReflections,
                {
                  content: reflectionContent,
                  timestamp: reflectionTimestamp,
                },
              ],
              updated_at: new Date().toISOString(),
            })
            .eq("id", journalEntry.id);

          if (journalUpdateError) {
            console.error(
              "Error updating journal reflections:",
              journalUpdateError
            );
          }
        }
        // We don't create a new journal entry here - those should be created in the journal flow
      }
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Unexpected error in wrapup service:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};
