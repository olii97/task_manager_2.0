
import { supabase } from '@/integrations/supabase/client';
import { StravaActivity, SavedStravaActivity } from '@/types/strava';
import { parseISO, format } from 'date-fns';

/**
 * Saves a Strava activity to the database
 */
export const saveStravaActivity = async (
  userId: string, 
  activity: StravaActivity
): Promise<boolean> => {
  try {
    // Extract relevant data from the activity
    const activityData = {
      id: activity.id,
      user_id: userId,
      name: activity.name,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time,
      type: activity.type,
      sport_type: activity.sport_type,
      start_date: activity.start_date,
      start_date_local: activity.start_date_local,
      timezone: activity.timezone,
      average_speed: activity.average_speed,
      max_speed: activity.max_speed,
      average_heartrate: activity.average_heartrate || null,
      max_heartrate: activity.max_heartrate || null,
      calories: activity.calories || null
    };

    const { error } = await supabase
      .from('strava_activities')
      .upsert(activityData);

    if (error) {
      console.error('Error saving Strava activity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error saving Strava activity:', error);
    return false;
  }
};

/**
 * Retrieves Strava activities for a user from the database
 */
export const getStoredStravaActivities = async (userId: string): Promise<SavedStravaActivity[]> => {
  try {
    const { data, error } = await supabase
      .from('strava_activities')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching Strava activities:', error);
      return [];
    }

    return (data || []).map(activity => ({
      ...activity,
      id: Number(activity.id),
      saved: true,
      total_elevation_gain: 0,
      utc_offset: 0,
      map: {
        id: "",
        summary_polyline: "",
        resource_state: 2
      }
    } as SavedStravaActivity));
  } catch (error) {
    console.error('Unexpected error fetching Strava activities:', error);
    return [];
  }
};

/**
 * Retrieves a Strava activity by its ID
 */
export const getStravaActivityById = async (
  userId: string,
  activityId: string | number
): Promise<SavedStravaActivity | null> => {
  try {
    const { data, error } = await supabase
      .from('strava_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('id', activityId)
      .single();

    if (error) {
      console.error('Error fetching Strava activity:', error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      id: Number(data.id),
      saved: true,
      total_elevation_gain: 0,
      utc_offset: 0,
      map: {
        id: "",
        summary_polyline: "",
        resource_state: 2
      }
    } as SavedStravaActivity;
  } catch (error) {
    console.error('Unexpected error fetching Strava activity:', error);
    return null;
  }
};

/**
 * Gets recent activity IDs to avoid re-fetching
 */
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

    // Convert string IDs to numbers
    return (data || []).map(item => Number(item.id));
  } catch (error) {
    console.error('Unexpected error fetching stored activity IDs:', error);
    return [];
  }
};
