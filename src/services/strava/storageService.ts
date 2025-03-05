
import { supabase } from "@/integrations/supabase/client";
import { StravaActivity, SavedStravaActivity, toSavedStravaActivity } from "@/types/strava";
import { StravaOperationResult } from "./types";

/**
 * Gets all stored Strava activity IDs for a user
 */
export const getStoredActivityIds = async (userId: string): Promise<number[]> => {
  try {
    const { data, error } = await supabase
      .from("strava_activities")
      .select("id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching stored activity IDs:", error);
      return [];
    }

    return data.map(item => item.id);
  } catch (error) {
    console.error("Error fetching stored activity IDs:", error);
    return [];
  }
};

/**
 * Transforms a Strava activity for database storage
 */
export const transformActivityForDatabase = async (activity: StravaActivity) => {
  const { 
    id,
    name,
    type,
    distance,
    moving_time,
    elapsed_time,
    total_elevation_gain,
    start_date,
    start_date_local,
    timezone,
    location_city,
    location_state,
    location_country,
    average_speed,
    max_speed,
    average_heartrate,
    max_heartrate,
    map,
    average_cadence,
    device_name,
    splits_metric,
    splits_standard,
  } = activity;

  // Get the current user ID
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  return {
    id,
    name,
    type,
    distance,
    moving_time,
    elapsed_time,
    total_elevation_gain,
    start_date,
    start_date_local: start_date_local || start_date,
    timezone,
    location_city,
    location_state,
    location_country,
    map_id: map?.id,
    map_summary_polyline: map?.summary_polyline,
    average_speed,
    max_speed,
    average_heartrate,
    max_heartrate,
    average_cadence,
    device_name,
    splits_metric: splits_metric ? JSON.stringify(splits_metric) : null,
    splits_standard: splits_standard ? JSON.stringify(splits_standard) : null,
    user_id: userId,
  };
};

/**
 * Saves a Strava activity to the database
 */
export const saveActivityToDatabase = async (activity: StravaActivity): Promise<SavedStravaActivity | null> => {
  try {
    const dbActivity = await transformActivityForDatabase(activity);
    
    const { data, error } = await supabase
      .from("strava_activities")
      .upsert(dbActivity, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      console.error("Error saving activity to database:", error);
      return null;
    }

    return toSavedStravaActivity(activity, true);
  } catch (error) {
    console.error("Error in saveActivityToDatabase:", error);
    return null;
  }
};

/**
 * Deletes a Strava activity from the database
 */
export const deleteActivityFromDatabase = async (userId: string, activityId: number): Promise<StravaOperationResult> => {
  try {
    console.log(`Deleting activity ${activityId} from database`);
    
    const { error } = await supabase
      .from("strava_activities")
      .delete()
      .eq("id", activityId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting activity from database:", error);
      throw error;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting activity:", error);
    return { 
      success: false, 
      error: error.message || "Failed to delete activity" 
    };
  }
};
