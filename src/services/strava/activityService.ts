
import { supabase } from "@/integrations/supabase/client";
import { StravaActivity, SavedStravaActivity, toSavedStravaActivity } from "@/types/strava";
import { StravaActivitiesResponse, StravaActivityResult } from "./types";
import { getStoredActivityIds, saveActivityToDatabase } from "./storageService";

/**
 * Fetches Strava activities from the API
 */
export const fetchStravaActivities = async (userId: string): Promise<StravaActivitiesResponse> => {
  try {
    console.log("Fetching activities for user:", userId);
    
    const { data, error } = await supabase.functions.invoke<StravaActivity[]>(
      "strava-auth",
      {
        body: { 
          action: "get_activities",
          userId: userId
        }
      }
    );

    if (error) {
      console.error("Strava function error:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No activities found");
    } else {
      console.log("Fetched activities:", data.length);
    }

    return { activities: data || [], error: null };
  } catch (error: any) {
    console.error("Error fetching activities:", error);
    return { 
      activities: [], 
      error: error.message || "Failed to fetch activities"
    };
  }
};

/**
 * Gets Strava activities and marks which ones are saved in the database
 */
export const getStravaActivities = async (userId: string): Promise<SavedStravaActivity[]> => {
  try {
    console.log("Fetching activities for user:", userId);
    
    const { activities, error } = await fetchStravaActivities(userId);
    
    if (error) {
      throw new Error(error);
    }

    const savedActivities = await getStoredActivityIds(userId);
    const activitiesWithSavedStatus = activities.map(activity => ({
      ...activity,
      saved: savedActivities.includes(activity.id)
    }));

    return activitiesWithSavedStatus;
  } catch (error: any) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

/**
 * Gets details for a specific Strava activity
 */
export const getStravaActivityDetails = async (userId: string, activityId: number): Promise<StravaActivityResult> => {
  try {
    console.log(`Fetching details for activity ${activityId}`);
    
    // First try to get from database
    const { data: storedActivity } = await supabase
      .from("strava_activities")
      .select("*")
      .eq("id", activityId)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (storedActivity) {
      console.log("Retrieved activity from database");
      // Fix the type casting issue here by properly mapping database fields to StravaActivity
      const activity: StravaActivity = {
        id: storedActivity.id,
        name: storedActivity.name,
        type: storedActivity.type,
        distance: storedActivity.distance,
        moving_time: storedActivity.moving_time,
        elapsed_time: storedActivity.elapsed_time,
        total_elevation_gain: storedActivity.total_elevation_gain || 0,
        start_date: storedActivity.start_date,
        start_date_local: storedActivity.start_date_local || storedActivity.start_date,
        timezone: storedActivity.timezone || "",
        utc_offset: storedActivity.utc_offset || 0,
        location_city: storedActivity.location_city || null,
        location_state: storedActivity.location_state || null,
        location_country: storedActivity.location_country || null,
        average_speed: storedActivity.average_speed || 0,
        max_speed: storedActivity.max_speed || 0,
        average_heartrate: storedActivity.average_heartrate || 0,
        max_heartrate: storedActivity.max_heartrate || 0,
        map: {
          id: storedActivity.map_id || "",
          summary_polyline: storedActivity.summary_polyline || "",
          resource_state: 0
        },
        trainer: storedActivity.trainer || false,
        commute: storedActivity.commute || false,
        manual: storedActivity.manual || false,
        private: storedActivity.private || false,
        visibility: storedActivity.visibility || "",
        average_cadence: storedActivity.average_cadence || 0,
        average_watts: storedActivity.average_watts || 0,
        kilojoules: storedActivity.kilojoules || 0,
        description: storedActivity.description || null,
        gear_id: storedActivity.gear_id || null,
        average_temp: storedActivity.average_temp || 0,
        average_watts_weighted: storedActivity.weighted_average_watts || 0,
        display_hide_heartrate_zone: storedActivity.display_hide_heartrate_zone || false,
        device_name: storedActivity.device_name || "",
        pr_count: storedActivity.pr_count || 0,
        saved: true
      };
      
      return { activity, error: null };
    }
    
    // Otherwise fetch from Strava API
    const { data, error } = await supabase.functions.invoke(
      "strava-auth",
      {
        body: { 
          action: "get_activity_details",
          userId: userId,
          activityId: activityId
        }
      }
    );

    if (error) {
      console.error("Strava function error:", error);
      throw error;
    }

    const savedActivities = await getStoredActivityIds(userId);
    const isSaved = savedActivities.includes(activityId);

    return { 
      activity: {
        ...data,
        saved: isSaved
      } as SavedStravaActivity, 
      error: null 
    };
  } catch (error: any) {
    console.error("Error fetching activity details:", error);
    return { 
      activity: null, 
      error: error.message || "Failed to fetch activity details"
    };
  }
};

/**
 * Maps activity data from the API to our StravaActivity type
 */
export const mapActivityFromAPI = (activity: any): StravaActivity => {
  return {
    id: activity.id,
    name: activity.name,
    type: activity.type,
    distance: activity.distance,
    moving_time: activity.moving_time,
    elapsed_time: activity.elapsed_time,
    total_elevation_gain: activity.total_elevation_gain,
    start_date: activity.start_date || activity.start_date_local || new Date().toISOString(),
    start_date_local: activity.start_date_local || activity.start_date,
    timezone: activity.timezone || "",
    utc_offset: activity.utc_offset || 0,
    location_city: activity.location_city || null,
    location_state: activity.location_state || null,
    location_country: activity.location_country || null,
    average_speed: activity.average_speed || 0,
    max_speed: activity.max_speed || 0,
    average_heartrate: activity.average_heartrate || 0,
    max_heartrate: activity.max_heartrate || 0,
    map: activity.map || { id: "", summary_polyline: "", resource_state: 0 },
    trainer: activity.trainer || false,
    commute: activity.commute || false,
    manual: activity.manual || false,
    private: activity.private || false,
    visibility: activity.visibility || "",
    average_cadence: activity.average_cadence || 0,
    average_watts: activity.average_watts || 0,
    kilojoules: activity.kilojoules || 0,
    description: activity.description || null,
    gear_id: activity.gear_id || null,
    average_temp: activity.average_temp || 0,
    average_watts_weighted: activity.average_watts_weighted || 0,
    display_hide_heartrate_zone: activity.display_hide_heartrate_zone || false,
    device_name: activity.device_name || "",
    pr_count: activity.pr_count || 0,
  };
};
