
import { supabase } from "@/integrations/supabase/client";
import { StravaActivity, SavedStravaActivity } from "@/types/strava";
import { StravaActionResult } from "./types";

/**
 * Saves a Strava activity to the database
 */
export const saveStravaActivity = async (
  userId: string, 
  activity: StravaActivity
): Promise<StravaActionResult> => {
  try {
    // Process polyline and other map data
    const mapData = activity.map ? JSON.stringify(activity.map) : null;
    const summaryPolyline = activity.map?.summary_polyline || null;
    
    // Process arrays
    const laps = activity.laps ? JSON.stringify(activity.laps) : null;
    const splitsMetric = activity.splits_metric ? JSON.stringify(activity.splits_metric) : null;
    const splitsStandard = activity.splits_standard ? JSON.stringify(activity.splits_standard) : null;
    const segmentEfforts = activity.segment_efforts ? JSON.stringify(activity.segment_efforts) : null;
    const startLatLng = activity.start_latlng ? JSON.stringify(activity.start_latlng) : null;
    const endLatLng = activity.end_latlng ? JSON.stringify(activity.end_latlng) : null;
    
    const { error } = await supabase
      .from("strava_activities")
      .upsert({
        id: activity.id,
        user_id: userId,
        name: activity.name,
        type: activity.type,
        distance: activity.distance,
        moving_time: activity.moving_time,
        elapsed_time: activity.elapsed_time,
        total_elevation_gain: activity.total_elevation_gain,
        start_date: activity.start_date,
        average_speed: activity.average_speed,
        max_speed: activity.max_speed,
        average_heartrate: activity.average_heartrate,
        max_heartrate: activity.max_heartrate,
        average_cadence: activity.average_cadence,
        average_watts: activity.average_watts,
        kilojoules: activity.kilojoules,
        max_watts: activity.max_watts,
        elevation_high: activity.elevation_high,
        elevation_low: activity.elevation_low,
        pr_count: activity.pr_count,
        device_name: activity.device_name,
        gear_id: activity.gear_id,
        calories: activity.calories,
        temperature: activity.average_temp,
        weighted_average_watts: activity.average_watts_weighted,
        map_data: mapData,
        summary_polyline: summaryPolyline,
        laps: laps,
        splits_metric: splitsMetric,
        splits_standard: splitsStandard,
        segment_efforts: segmentEfforts,
        start_latlng: startLatLng,
        end_latlng: endLatLng,
      });

    if (error) {
      console.error("Error saving activity:", error);
      return {
        success: false,
        error: "Failed to save activity",
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    console.error("Error in saveStravaActivity:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

/**
 * Gets IDs of activities that have been saved to the database
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
    console.error("Error in getStoredActivityIds:", error);
    return [];
  }
};
