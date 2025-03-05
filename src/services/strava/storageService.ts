
import { supabase } from "@/integrations/supabase/client";
import { StravaActivity, SavedStravaActivity, toSavedStravaActivity } from "@/types/strava";
import { StravaActionResult } from "./types";

/**
 * Gets IDs of activities that are stored in the database
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
 * Saves an activity to the database
 */
export const saveActivityToDatabase = async (
  activity: StravaActivity
): Promise<SavedStravaActivity> => {
  try {
    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) {
      throw new Error("User not authenticated");
    }

    // Extract fields that exist in the database table
    const activityData = {
      id: activity.id,
      name: activity.name,
      type: activity.type,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time,
      total_elevation_gain: activity.total_elevation_gain || null,
      start_date: activity.start_date,
      map_id: activity.map?.id || null,
      summary_polyline: activity.map?.summary_polyline || null,
      average_speed: activity.average_speed || null,
      max_speed: activity.max_speed || null,
      average_heartrate: activity.average_heartrate || null,
      max_heartrate: activity.max_heartrate || null,
      average_cadence: activity.average_cadence || null,
      device_name: activity.device_name || null,
      average_watts: activity.average_watts || null,
      kilojoules: activity.kilojoules || null,
      gear_id: activity.gear_id || null,
      calories: activity.calories || null,
      elevation_high: activity.elevation_high || null,
      elevation_low: activity.elevation_low || null,
      pr_count: activity.pr_count || null,
      max_watts: activity.max_watts || null,
      weighted_average_watts: activity.average_watts_weighted || null,
      user_id: currentUser.data.user.id,
      // Convert complex objects to JSON
      start_latlng: activity.start_latlng ? JSON.stringify(activity.start_latlng) : null,
      end_latlng: activity.end_latlng ? JSON.stringify(activity.end_latlng) : null,
    };

    const { data, error } = await supabase
      .from("strava_activities")
      .upsert(activityData, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Error saving activity:", error);
      throw error;
    }

    return toSavedStravaActivity(activity, true);
  } catch (error) {
    console.error("Error in saveActivityToDatabase:", error);
    throw error;
  }
};

/**
 * Deletes an activity from the database
 */
export const deleteActivityFromDatabase = async (userId: string, activityId: number): Promise<StravaActionResult> => {
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
    return { success: false, error: error.message || "Failed to delete activity" };
  }
};
