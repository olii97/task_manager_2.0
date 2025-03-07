
import { supabase } from '@/integrations/supabase/client';
import { StravaActivity } from '@/types/strava';

export const saveStravaActivity = async (userId: string, activity: StravaActivity): Promise<{ success: boolean, error: string | null }> => {
  try {
    // Check if the activity already exists
    const { data: existingActivity, error: checkError } = await supabase
      .from('strava_activities')
      .select('id')
      .eq('activity_id', activity.id.toString())
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "Results contain 0 rows" which is expected
      console.error('Error checking for existing activity:', checkError);
      return { success: false, error: checkError.message };
    }

    if (existingActivity) {
      // Activity already exists, update it
      const { error: updateError } = await supabase
        .from('strava_activities')
        .update({
          data: activity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingActivity.id);

      if (updateError) {
        console.error('Error updating activity:', updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      // Activity doesn't exist, insert it
      const { error: insertError } = await supabase
        .from('strava_activities')
        .insert([{
          user_id: userId,
          activity_id: activity.id.toString(),
          data: activity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('Error inserting activity:', insertError);
        return { success: false, error: insertError.message };
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error saving Strava activity:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

export const getSavedStravaActivities = async (userId: string): Promise<StravaActivity[]> => {
  try {
    const { data, error } = await supabase
      .from('strava_activities')
      .select('data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved Strava activities:', error);
      return [];
    }

    // Extract the activity data from each record
    return (data || []).map(record => ({
      ...record.data,
      saved: true
    }));
  } catch (error) {
    console.error('Unexpected error fetching saved Strava activities:', error);
    return [];
  }
};

export const deleteSavedStravaActivity = async (userId: string, activityId: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    const { error } = await supabase
      .from('strava_activities')
      .delete()
      .eq('user_id', userId)
      .eq('activity_id', activityId);

    if (error) {
      console.error('Error deleting saved Strava activity:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error deleting saved Strava activity:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};
