
import { supabase } from "@/integrations/supabase/client";

// Define the types needed
interface WrapUpData {
  productivityRating: number;
  energyRating: number;
  focusRating: number;
  completedTasksCount: number;
  uncompletedTasksCount: number;
  highPriorityCompleted: number;
  reflections: string;
  journalContent?: string;
}

interface WrapUpResponse {
  success: boolean;
  error?: string;
}

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

    // Store the data in the journal_entries table instead of daily_wrapup
    // which doesn't exist in the database schema
    const { error } = await supabase
      .from("journal_entries")
      .upsert({
        user_id: userId,
        date: wrapupDate,
        reflection: data.reflections || "",
        energy: data.energyRating || 0,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,date'
      });

    if (error) {
      console.error("Error storing wrapup data:", error);
      return {
        success: false,
        error: "Failed to store wrap-up data",
      };
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

// Add these functions that were missing
export const generateDailyWrapup = async (userId: string) => {
  // Implement a simple function to get data for the day
  const today = new Date().toISOString().split("T")[0];
  
  // Get journal entry for today
  const { data: journalEntry } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  // Get task counts
  const { data: completedTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("completed", true)
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`);

  // Create a summary object
  const wrapupData = {
    date: today,
    journalData: journalEntry || null,
    taskData: {
      completedCount: completedTasks?.length || 0,
    },
    summary: "Your day at a glance",
  };

  return wrapupData;
};

export const downloadWrapupAsJson = (data: any) => {
  // Create a blob with the data
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `daily-wrapup-${new Date().toISOString().split("T")[0]}.json`;
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  URL.revokeObjectURL(url);
  document.body.removeChild(link);
};
