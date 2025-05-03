import { supabase } from "@/integrations/supabase/client";
import { toast, useToast } from "@/hooks/use-toast";

// XP related functions
export const addTaskCompletionXP = async (
  userId: string,
  taskTitle: string
): Promise<void> => {
  try {
    await supabase
      .from("user_xp")
      .insert({
        user_id: userId,
        xp_amount: 20, // P1 tasks give 20 XP
        reason: `Completed P1 task: ${taskTitle}`,
      });

    const { id, dismiss } = toast({
      title: "+20 XP!",
      description: "You earned XP for completing a high-priority task!",
      className: "bg-yellow-100 border-yellow-400",
      duration: 1500, // Auto dismiss after 1.5 seconds
    });
    
    // Force dismiss the toast after a fixed time as a backup
    setTimeout(() => {
      dismiss();
    }, 2000);
  } catch (error) {
    console.error("Error adding XP:", error);
  }
};

export const getUserTotalXP = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from("user_xp")
      .select("xp_amount")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user XP:", error);
      throw error;
    }

    return data.reduce((total, record) => total + record.xp_amount, 0);
  } catch (error) {
    console.error("Error in getUserTotalXP:", error);
    return 0;
  }
};
