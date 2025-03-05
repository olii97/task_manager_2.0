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

const mapActivityFromAPI = (activity: any): StravaActivity => {
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

const transformActivityForDatabase = async (activity: StravaActivity) => {
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
    average_cadence,
    device_name,
  } = activity;

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
    start_date_local,
    timezone,
    location_city,
    location_state,
    location_country,
    map_id: activity.map?.id,
    map_summary_polyline: activity.map?.summary_polyline,
    average_speed,
    max_speed,
    average_heartrate,
    max_heartrate,
    average_cadence,
    device_name,
    splits_metric: activity.splits_metric ? JSON.stringify(activity.splits_metric) : null,
    splits_standard: activity.splits_standard ? JSON.stringify(activity.splits_standard) : null,
    user_id: userId,
  };
};

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
