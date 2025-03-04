
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const bulkScheduleTasks = async (
  taskIds: string[],
  energyLevel: 'high' | 'low'
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("tasks")
      .update({ 
        is_scheduled_today: true, 
        energy_level: energyLevel 
      })
      .in("id", taskIds);

    if (error) {
      console.error("Error bulk scheduling tasks:", error);
      throw error;
    }

    toast({
      title: "Tasks scheduled",
      description: `${taskIds.length} tasks have been scheduled for today.`,
    });
  } catch (error) {
    console.error("Error in bulkScheduleTasks:", error);
    throw error;
  }
};

export const resetDailySchedule = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("tasks")
      .update({ is_scheduled_today: false, energy_level: null })
      .eq("user_id", userId)
      .eq("is_completed", false);

    if (error) {
      console.error("Error resetting daily schedule:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in resetDailySchedule:", error);
    throw error;
  }
};
