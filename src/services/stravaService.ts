import { supabase } from "@/integrations/supabase/client";
import { StravaActivity, SavedStravaActivity, toSavedStravaActivity } from "@/types/strava";
import { toast } from "sonner";

export const isConnectedToStrava = async (userId: string) => {
  try {
    const { data: tokens, error } = await supabase
      .from("strava_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // Not the "no rows returned" error
        console.error("Error checking Strava connection:", error);
        toast.error("Error checking Strava connection");
      }
      return false;
    }

    return !!tokens;
  } catch (error) {
    console.error("Error checking Strava connection:", error);
    return false;
  }
};

export const checkStravaConnection = async (userId: string) => {
  try {
    const isConnected = await isConnectedToStrava(userId);
    return { isConnected, error: null };
  } catch (error: any) {
    console.error("Error checking Strava connection:", error);
    return { isConnected: false, error: error.message || "Failed to check Strava connection" };
  }
};

export const getStravaActivities = async (userId: string) => {
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

export const fetchStravaActivities = async (userId: string) => {
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

export const connectToStrava = async (sessionToken: string) => {
  try {
    const response = await supabase.functions.invoke<{ url: string }>(
      "strava-auth",
      {
        body: { action: "get_auth_url" },
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );

    if (response.error) {
      console.error("Strava auth URL error:", response.error);
      throw response.error;
    }

    if (!response.data?.url) {
      throw new Error("No authorization URL received");
    }

    return { url: response.data.url, error: null };
  } catch (error: any) {
    console.error("Error connecting to Strava:", error);
    return { url: null, error: error.message || "Failed to connect to Strava" };
  }
};

export const disconnectFromStrava = async (userId: string) => {
  try {
    const { error } = await supabase
      .from("strava_tokens")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error disconnecting Strava:", error);
      throw error;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error disconnecting from Strava:", error);
    return { success: false, error: error.message || "Failed to disconnect from Strava" };
  }
};

export const getStravaActivityDetails = async (userId: string, activityId: number) => {
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
          start_date_local: storedActivity.start_date_local || storedActivity.start_date
        }, 
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
      }, 
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

export const saveActivityToDatabase = async (
  activity: StravaActivity
): Promise<SavedStravaActivity> => {
  try {
    if (!activity.athlete || !activity.athlete.id) {
      console.error("Missing athlete information in activity:", activity);
      throw new Error("Missing athlete information");
    }

    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) {
      throw new Error("User not authenticated");
    }

    const {
      id,
      name,
      type,
      distance,
      moving_time,
      elapsed_time,
      total_elevation_gain,
      start_date,
      map,
      average_speed,
      max_speed,
      average_heartrate,
      max_heartrate,
      average_cadence,
      device_name,
      splits_metric,
      splits_standard,
      location_city,
      location_state,
      location_country,
      average_watts,
      kilojoules,
      gear_id,
      start_latlng,
      end_latlng,
      calories,
      temperature,
      elevation_high,
      elevation_low,
      pr_count,
      max_watts,
      weighted_average_watts,
      segments_efforts,
      laps
    } = activity;

    const activityData = {
      id,
      name,
      type,
      distance,
      moving_time,
      elapsed_time,
      total_elevation_gain: total_elevation_gain || null,
      start_date,
      map_id: map?.id || null,
      summary_polyline: map?.summary_polyline || null,
      average_speed: average_speed || null,
      max_speed: max_speed || null,
      average_heartrate: average_heartrate || null,
      max_heartrate: max_heartrate || null,
      average_cadence: average_cadence || null,
      device_name: device_name || null,
      location_city: location_city || null,
      location_state: location_state || null,
      location_country: location_country || null,
      average_watts: average_watts || null,
      kilojoules: kilojoules || null,
      gear_id: gear_id || null,
      start_latlng: start_latlng || null,
      end_latlng: end_latlng || null,
      calories: calories || null,
      temperature: temperature || null,
      elevation_high: elevation_high || null,
      elevation_low: elevation_low || null,
      pr_count: pr_count || null,
      max_watts: max_watts || null,
      weighted_average_watts: weighted_average_watts || null,
      athlete_id: activity.athlete?.id || null,
      splits_metric: splits_metric || null,
      splits_standard: splits_standard || null,
      user_id: currentUser.data.user.id,
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

export const deleteActivityFromDatabase = async (userId: string, activityId: number) => {
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

export const updateStravaEdgeFunction = async () => {
  return { success: true, error: null };
};
