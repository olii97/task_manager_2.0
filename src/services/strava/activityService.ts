
import { supabase } from "@/integrations/supabase/client";
import { StravaActivity, SavedStravaActivity, toSavedStravaActivity } from "@/types/strava";
import { StravaActivitiesResult, StravaActivityDetailsResult, StravaActionResult } from "./types";
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
    
    const { data: storedActivity } = await supabase
      .from("strava_activities")
      .select("*")
      .eq("id", activityId)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (storedActivity) {
      console.log("Retrieved activity from database");
      return { 
        activity: {
          ...storedActivity,
          saved: true,
          start_date_local: storedActivity.start_date || "",
          timezone: "",
          utc_offset: 0,
          map: {
            id: storedActivity.map_id || '',
            summary_polyline: storedActivity.summary_polyline || '',
            resource_state: 2,
          },
          trainer: false,
          commute: false,
          manual: false,
          private: false,
          visibility: '',
          description: null,
          display_hide_heartrate_zone: false,
        } as SavedStravaActivity, 
        error: null 
      };
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
