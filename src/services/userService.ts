
import { supabase } from "@/integrations/supabase/client";

export const addUserXP = async (userId: string, xpAmount: number, reason: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("user_xp")
      .insert({
        user_id: userId,
        xp_amount: xpAmount,
        reason: reason,
      });

    if (error) {
      console.error("Error adding user XP:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in addUserXP:", error);
    return false;
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
      return 0;
    }

    // Sum up all XP amounts
    return data.reduce((total, entry) => total + entry.xp_amount, 0);
  } catch (error) {
    console.error("Unexpected error in getUserTotalXP:", error);
    return 0;
  }
};
