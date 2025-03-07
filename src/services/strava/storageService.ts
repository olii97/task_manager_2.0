import { supabase } from '@/integrations/supabase/client';
import { StravaActivity, SavedStravaActivity } from '@/types/strava';

/**
 * Saves a Strava activity to the database
 */
export const saveStravaActivity = async (userId: string, activity: SavedStravaActivity): Promise<boolean> => {
  try {
    console.log("Saving activity:", activity.id);
    
    // Check if activity already exists
    const { data: existingActivity, error: selectError } = await supabase
      .from('strava_activities')
      .select('id')
      .eq('id', activity.id)
      .single();
      
    if (selectError && selectError.code !== 'PGRST116') {
      console.error("Error checking existing activity:", selectError);
      return false;
    }
    
    const { data, error } = await supabase
      .from('strava_activities')
      .upsert({
        id: activity.id,
        user_id: userId,
        name: activity.name,
        type: activity.type || activity.sport_type,
        distance: activity.distance,
        moving_time: activity.moving_time,
        elapsed_time: activity.elapsed_time,
        total_elevation_gain: activity.total_elevation_gain,
        start_date: activity.start_date,
        average_speed: activity.average_speed,
        max_speed: activity.max_speed,
        average_heartrate: activity.average_heartrate,
        max_heartrate: activity.max_heartrate,
        summary_polyline: activity.map?.summary_polyline || '',
        map_data: JSON.stringify(activity.map || {}),
        // Add any other fields you want to store
      });

    if (error) {
      console.error("Error saving activity:", error);
      return false;
    }

    console.log("Activity saved successfully:", activity.id);
    return true;
  } catch (error) {
    console.error("Error saving activity:", error);
    return false;
  }
};

/**
 * Retrieves a Strava activity by its ID
 */
export const getStravaActivityById = async (userId: string, activityId: number): Promise<SavedStravaActivity | null> => {
  try {
    console.log(`Getting activity by id ${activityId}`);
    
    const { data, error } = await supabase
      .from('strava_activities')
      .select('*')
      .eq('id', activityId)
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no data is found, it's not an error, just return null
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error("Error fetching activity:", error);
      throw error;
    }

    return data as SavedStravaActivity;
  } catch (error) {
    console.error("Error fetching activity:", error);
    return null;
  }
};

/**
 * Retrieves all stored activity IDs for a user
 */
export const getStoredActivityIds = async (userId: string): Promise<number[]> => {
  try {
    console.log("Getting stored activity ids");
    
    const { data, error } = await supabase
      .from('strava_activities')
      .select('id')
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching activity IDs:", error);
      throw error;
    }

    // Extract and return only the IDs
    const activityIds = data.map(activity => activity.id);
    return activityIds;
  } catch (error) {
    console.error("Error fetching activity IDs:", error);
    return [];
  }
};

/**
 * Retrieves all stored activities for a user
 */
export const getStoredStravaActivities = async (userId: string): Promise<SavedStravaActivity[]> => {
  try {
    const { data, error } = await supabase
      .from('strava_activities')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error fetching stored activities:", error);
      throw error;
    }
    
    return data.map((activity: any) => ({
      id: activity.id,
      name: activity.name,
      type: activity.type,
      sport_type: activity.type,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time,
      total_elevation_gain: activity.total_elevation_gain,
      start_date: activity.start_date,
      start_date_local: activity.start_date,
      timezone: "",
      utc_offset: 0,
      average_speed: activity.average_speed,
      max_speed: activity.max_speed,
      average_heartrate: activity.average_heartrate,
      max_heartrate: activity.max_heartrate,
      map: {
        id: "",
        summary_polyline: activity.summary_polyline || "",
        resource_state: 2
      },
      saved: true
    }));
  } catch (error) {
    console.error("Error fetching stored activities:", error);
    return [];
  }
};
