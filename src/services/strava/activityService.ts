
import { supabase } from "@/integrations/supabase/client";
import { StravaActivity, SavedStravaActivity } from "@/types/strava";
import { StravaActivitiesResult, StravaActivityDetailsResult } from "./types";
import { getStoredActivityIds } from "./storageService";

/**
 * Fetches activities from Strava API
 */
export const fetchStravaActivities = async (userId: string): Promise<StravaActivitiesResult> => {
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
 * Gets activities with saved status
 */
export const getStravaActivities = async (userId: string): Promise<StravaActivity[]> => {
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
 * Gets detailed information for a specific activity
 */
export const getStravaActivityDetails = async (userId: string, activityId: number): Promise<StravaActivityDetailsResult> => {
  try {
    console.log(`Fetching details for activity ${activityId}`);
    
    const { data: storedActivities } = await supabase
      .from("strava_activities")
      .select("*")
      .eq("id", activityId)
      .eq("user_id", userId);
    
    if (storedActivities && storedActivities.length > 0) {
      console.log("Retrieved activity from database");
      const storedActivity = storedActivities[0];
      
      // Map the database record to a SavedStravaActivity
      const savedActivity: SavedStravaActivity = {
        id: storedActivity.id,
        name: storedActivity.name,
        type: storedActivity.type,
        sport_type: storedActivity.type,
        distance: storedActivity.distance,
        moving_time: storedActivity.moving_time,
        elapsed_time: storedActivity.elapsed_time,
        total_elevation_gain: storedActivity.total_elevation_gain || 0,
        start_date: storedActivity.start_date,
        start_date_local: storedActivity.start_date || "",
        timezone: "",
        utc_offset: 0,
        location_city: null,
        location_state: null,
        location_country: null,
        average_speed: storedActivity.average_speed || 0,
        max_speed: storedActivity.max_speed || 0,
        average_heartrate: storedActivity.average_heartrate || 0,
        max_heartrate: storedActivity.max_heartrate || 0,
        map: {
          id: storedActivity.map_data ? JSON.parse(String(storedActivity.map_data)).id : "",
          summary_polyline: storedActivity.summary_polyline || "",
          resource_state: 2,
        },
        saved: true
      };
      
      return { activity: savedActivity, error: null };
    }
    
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
