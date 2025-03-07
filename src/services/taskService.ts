
import { supabase } from "@/integrations/supabase/client";

export const markTaskComplete = async (taskId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("tasks")
      .update({
        is_completed: true,
        completion_date: new Date().toISOString()
      })
      .eq("id", taskId);

    if (error) {
      console.error("Error marking task as complete:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in markTaskComplete:", error);
    return false;
  }
};

export const markTaskIncomplete = async (taskId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("tasks")
      .update({
        is_completed: false,
        completion_date: null
      })
      .eq("id", taskId);

    if (error) {
      console.error("Error marking task as incomplete:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in markTaskIncomplete:", error);
    return false;
  }
};
