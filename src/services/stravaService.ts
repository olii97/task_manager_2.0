
import { supabase } from "@/integrations/supabase/client";
import { StravaActivity, SavedStravaActivity } from "@/types/strava";
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

// Add checkStravaConnection function for the StravaActivities component
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

    // Check which activities are already saved in the database
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
    
    // Make sure we're explicitly sending the userId in the request body
    const { data, error } = await supabase.functions.invoke<StravaActivity[]>(
      "strava-auth",
      {
        body: { 
          action: "get_activities",
          userId: userId  // Explicitly use the userId variable
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
    // Make sure to pass the Authorization header with the JWT token
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

    // Return the URL to be opened
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
    
    // First check if the activity is already stored in our database
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
          saved: true
        }, 
        error: null 
      };
    }
    
    // If not in database, fetch from Strava API
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

    // Check if this activity is saved
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

export const saveActivityToDatabase = async (userId: string, activity: StravaActivity) => {
  try {
    console.log(`Saving activity ${activity.id} to database`);
    
    // Extract relevant fields from the activity to store in database
    const { 
      id, name, type, start_date, distance, moving_time, elapsed_time,
      total_elevation_gain, average_speed, max_speed, average_heartrate, 
      max_heartrate, map, start_latlng, end_latlng, device_name, gear_id,
      calories, average_cadence, average_watts, kilojoules, average_temp,
      average_watts_weighted, elevation_high, elevation_low, pr_count,
      laps, splits_metric, splits_standard
    } = activity;
    
    const { error } = await supabase
      .from("strava_activities")
      .upsert({
        id,
        user_id: userId,
        name,
        type,
        start_date,
        distance,
        moving_time,
        elapsed_time,
        total_elevation_gain,
        average_speed,
        max_speed,
        average_heartrate,
        max_heartrate,
        start_latlng: start_latlng ? start_latlng : null,
        end_latlng: end_latlng ? end_latlng : null,
        summary_polyline: map?.summary_polyline || null,
        map_data: map ? map : null,
        device_name: device_name || null,
        gear_id: gear_id || null,
        calories: calories || null,
        average_cadence: average_cadence || null,
        average_watts: average_watts || null,
        kilojoules: kilojoules || null,
        temperature: average_temp || null,
        elevation_high: elevation_high || null,
        elevation_low: elevation_low || null,
        pr_count: pr_count || 0,
        laps: laps || null,
        splits_metric: splits_metric || null,
        splits_standard: splits_standard || null,
      });

    if (error) {
      console.error("Error saving activity to database:", error);
      throw error;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error saving activity:", error);
    return { success: false, error: error.message || "Failed to save activity" };
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

// Update the Strava edge function to also fetch detailed activity data
export const updateStravaEdgeFunction = async () => {
  // This would typically update the Strava edge function code,
  // but we'll handle this in a separate step by updating the function directly
  return { success: true, error: null };
};
