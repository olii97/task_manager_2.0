
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
    // First get the current XP
    const { data: userData, error: fetchError } = await supabase
      .from('profiles')
      .select('xp')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user XP:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const currentXP = userData?.xp || 0;
    const newXP = currentXP + amount;

    // Update the XP
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ xp: newXP })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user XP:', updateError);
      return { success: false, error: updateError.message };
    }

    // Log the XP gain
    const { error: logError } = await supabase
      .from('xp_history')
      .insert([
        {
          user_id: userId,
          amount,
          reason: reason || 'XP added',
          created_at: new Date().toISOString()
        }
      ]);

    if (logError) {
      console.error('Error logging XP gain:', logError);
      // We don't return an error here because the XP was already added successfully
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
    const { data, error } = await supabase
      .from('profiles')
      .select('xp')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user XP:', error);
      return null;
    }

    return data?.xp || 0;
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
      .from('xp_history')
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
