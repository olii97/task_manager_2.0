
import { supabase } from '@/integrations/supabase/client';

/**
 * Adds XP to a user's profile
 * @param userId The ID of the user
 * @param amount The amount of XP to add
 * @param reason Optional reason for awarding XP
 * @returns Success status and error message if any
 */
export const addUserXP = async (
  userId: string, 
  amount: number, 
  reason?: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Log the XP gain
    const { error: logError } = await supabase
      .from('user_xp')
      .insert([
        {
          user_id: userId,
          xp_amount: amount,
          reason: reason || 'XP added',
          created_at: new Date().toISOString()
        }
      ]);

    if (logError) {
      console.error('Error logging XP gain:', logError);
      return { success: false, error: logError.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error adding user XP:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

/**
 * Gets a user's current XP
 * @param userId The ID of the user
 * @returns The user's current XP or null if there was an error
 */
export const getUserXP = async (userId: string): Promise<number | null> => {
  try {
    // Get sum of all XP awarded to user
    const { data, error } = await supabase
      .from('user_xp')
      .select('xp_amount')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user XP:', error);
      return null;
    }

    // Sum up all XP amounts
    const totalXP = data.reduce((sum, item) => sum + (item.xp_amount || 0), 0);
    return totalXP;
  } catch (error) {
    console.error('Unexpected error fetching user XP:', error);
    return null;
  }
};

/**
 * Gets a user's XP history
 * @param userId The ID of the user
 * @returns An array of XP history entries
 */
export const getXPHistory = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching XP history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching XP history:', error);
    return [];
  }
};
