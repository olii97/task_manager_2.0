
import { supabase } from '@/integrations/supabase/client';
import { StravaActivity } from '@/types/strava';

export const saveStravaActivity = async (userId: string, activity: StravaActivity): Promise<{ success: boolean, error: string | null }> => {
  try {
    // Check if the activity already exists
    const { data: existingActivities, error: checkError } = await supabase
      .from('strava_activities')
      .select('id')
      .eq('id', activity.id)
      .eq('user_id', userId);

    if (checkError) {
      console.error('Error checking for existing activity:', checkError);
      return { success: false, error: checkError.message };
    }

    if (existingActivities && existingActivities.length > 0) {
      // Activity already exists, update it
      const { error: updateError } = await supabase
        .from('strava_activities')
        .update({
          name: activity.name,
          type: activity.type,
          distance: activity.distance,
          moving_time: activity.moving_time,
          elapsed_time: activity.elapsed_time,
          total_elevation_gain: activity.total_elevation_gain,
          average_speed: activity.average_speed,
          max_speed: activity.max_speed,
          average_heartrate: activity.average_heartrate,
          max_heartrate: activity.max_heartrate,
          start_date: activity.start_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', activity.id)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating activity:', updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      // Activity doesn't exist, insert it
      const { error: insertError } = await supabase
        .from('strava_activities')
        .insert([{
          id: activity.id,
          user_id: userId,
          name: activity.name,
          type: activity.type,
          distance: activity.distance,
          moving_time: activity.moving_time,
          elapsed_time: activity.elapsed_time,
          total_elevation_gain: activity.total_elevation_gain,
          average_speed: activity.average_speed,
          max_speed: activity.max_speed,
          average_heartrate: activity.average_heartrate,
          max_heartrate: activity.max_heartrate,
          start_date: activity.start_date,
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
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved Strava activities:', error);
      return [];
    }

    // Convert database records to StravaActivity objects
    return (data || []).map(record => ({
      id: record.id,
      name: record.name,
      type: record.type,
      sport_type: record.type,
      distance: record.distance,
      moving_time: record.moving_time,
      elapsed_time: record.elapsed_time,
      total_elevation_gain: record.total_elevation_gain || 0,
      start_date: record.start_date,
      start_date_local: record.start_date,
      timezone: "",
      utc_offset: 0,
      location_city: null,
      location_state: null,
      location_country: null,
      average_speed: record.average_speed || 0,
      max_speed: record.max_speed || 0,
      average_heartrate: record.average_heartrate || 0,
      max_heartrate: record.max_heartrate || 0,
      saved: true,
      map: record.map_data ? JSON.parse(String(record.map_data)) : { id: "", summary_polyline: "" }
    }));
  } catch (error) {
    console.error('Unexpected error fetching saved Strava activities:', error);
    return [];
  }
};

// Add this function to implement the missing function referenced in activityService.ts
export const getStoredActivityIds = async (userId: string): Promise<number[]> => {
  try {
    const { data, error } = await supabase
      .from('strava_activities')
      .select('id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching stored activity IDs:', error);
      return [];
    }

    return (data || []).map(item => Number(item.id));
  } catch (error) {
    console.error('Unexpected error fetching stored activity IDs:', error);
    return [];
  }
};

export const deleteSavedStravaActivity = async (userId: string, activityId: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    const { error } = await supabase
      .from('strava_activities')
      .delete()
      .eq('user_id', userId)
      .eq('id', activityId);

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
