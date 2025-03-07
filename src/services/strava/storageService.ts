
import { supabase } from '@/integrations/supabase/client';
import { StravaActivity, SavedStravaActivity } from '@/types/strava';
import { toast } from '@/components/ui/use-toast';

interface StravaActivitiesResult {
  activities: SavedStravaActivity[];
  error: string | null;
}

/**
 * Gets stored activity IDs for a user
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
    
    return data ? data.map(item => Number(item.id)) : [];
  } catch (error) {
    console.error("Error in getStoredActivityIds:", error);
    return [];
  }
};

/**
 * Gets activities stored in the database
 */
export const getStoredStravaActivities = async (userId: string): Promise<StravaActivitiesResult> => {
  try {
    const { data, error } = await supabase
      .from("strava_activities")
      .select("*")
      .eq("user_id", userId);
    
    if (error) {
      console.error("Error fetching stored activities:", error);
      throw error;
    }
    
    const formattedActivities: SavedStravaActivity[] = data.map(activity => ({
      id: Number(activity.id),
      name: activity.name,
      type: activity.type,
      sport_type: activity.type,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time,
      total_elevation_gain: activity.total_elevation_gain || 0,
      start_date: activity.start_date,
      start_date_local: activity.start_date, // Use the same as start_date
      timezone: "", // Default empty
      utc_offset: 0, // Default to 0
      location_city: null,
      location_state: null,
      location_country: null,
      average_speed: activity.average_speed || 0,
      max_speed: activity.max_speed || 0,
      average_heartrate: activity.average_heartrate || 0,
      max_heartrate: activity.max_heartrate || 0,
      map: {
        id: activity.map_polyline ? `map_${activity.id}` : "",
        summary_polyline: activity.summary_polyline || "",
        resource_state: 2
      },
      saved: true
    }));

    return { activities: formattedActivities, error: null };
  } catch (error: any) {
    console.error("Error in getStoredStravaActivities:", error);
    return { activities: [], error: error.message || "Failed to fetch stored activities" };
  }
};

/**
 * Gets a single activity by ID
 */
export const getStravaActivityById = async (userId: string, activityId: number): Promise<SavedStravaActivity | null> => {
  try {
    const { data, error } = await supabase
      .from("strava_activities")
      .select("*")
      .eq("id", activityId)
      .eq("user_id", userId);
    
    if (error) {
      console.error("Error fetching activity by ID:", error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log(`No stored activity found with ID ${activityId}`);
      return null;
    }
    
    const activity = data[0];
    
    return {
      id: Number(activity.id),
      name: activity.name,
      type: activity.type,
      sport_type: activity.type,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time,
      total_elevation_gain: activity.total_elevation_gain || 0,
      start_date: activity.start_date,
      start_date_local: activity.start_date, // Use the same as start_date
      timezone: "", // Default empty
      utc_offset: 0, // Default to 0
      location_city: null,
      location_state: null,
      location_country: null,
      average_speed: activity.average_speed || 0,
      max_speed: activity.max_speed || 0,
      average_heartrate: activity.average_heartrate || 0,
      max_heartrate: activity.max_heartrate || 0,
      map: {
        id: activity.map_polyline ? `map_${activity.id}` : "",
        summary_polyline: activity.summary_polyline || "",
        resource_state: 2
      },
      saved: true
    };
  } catch (error) {
    console.error("Error in getStravaActivityById:", error);
    return null;
  }
};

/**
 * Saves a Strava activity to the database
 */
export const saveStravaActivity = async (userId: string, activity: StravaActivity): Promise<boolean> => {
  try {
    console.log(`Saving activity ${activity.id} for user ${userId}`);
    
    const { error } = await supabase.from("strava_activities").upsert({
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
      summary_polyline: activity.map?.summary_polyline || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    if (error) {
      console.error("Error saving activity:", error);
      toast({
        title: "Error",
        description: "Failed to save activity",
        variant: "destructive"
      });
      return false;
    }
    
    toast({
      title: "Success",
      description: "Activity saved successfully"
    });
    
    return true;
  } catch (error) {
    console.error("Error in saveStravaActivity:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred while saving the activity",
      variant: "destructive"
    });
    return false;
  }
};
