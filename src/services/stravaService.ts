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
          saved: true,
          // Ensure start_date_local exists for database-stored activities
          start_date_local: storedActivity.start_date_local || storedActivity.start_date
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

export const saveActivityToDatabase = async (
  activity: StravaActivity
): Promise<SavedStravaActivity> => {
  try {
    // Extract the fields we want to save
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
      kudos_count,
      achievement_count,
      pr_count,
      athlete,
      map,
      average_speed,
      max_speed,
      average_heartrate,
      max_heartrate,
      average_cadence,
      device_name,
      splits_metric,
      splits_standard,
    } = activity;

    // Make sure to include start_date_local in your record
    const { data, error } = await supabase
      .from("strava_activities")
      .upsert(
        {
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
          kudos_count,
          achievement_count,
          pr_count,
          athlete_id: athlete.id,
          map_id: map?.id,
          map_polyline: map?.polyline,
          map_summary_polyline: map?.summary_polyline,
          average_speed,
          max_speed,
          average_heartrate,
          max_heartrate,
          average_cadence,
          device_name,
          splits_metric: splits_metric || null,
          splits_standard: splits_standard || null,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (error) {
      console.error("Error saving activity:", error);
      throw error;
    }

    return {
      ...data,
      saved: true,
    } as SavedStravaActivity;
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

// Update the Strava edge function to also fetch detailed activity data
export const updateStravaEdgeFunction = async () => {
  // This would typically update the Strava edge function code,
  // but we'll handle this in a separate step by updating the function directly
  return { success: true, error: null };
};
