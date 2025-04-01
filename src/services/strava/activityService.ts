import { supabase } from '@/integrations/supabase/client';
import { StravaActivity, SavedStravaActivity, ActivityZones } from '@/types/strava';
import { getStravaToken, refreshTokenIfNeeded } from './connectionService';
import { getStoredActivityIds, saveStravaActivity, getStravaActivityById } from './storageService';

// Define the result types
interface StravaActivitiesResult {
  activities: StravaActivity[];
  error: string | null;
}

interface StravaActivityDetailsResult {
  activity: SavedStravaActivity | null;
  error: string | null;
}

/**
 * Fetches activities from Strava API
 */
export const fetchStravaActivities = async (
  userId: string,
  page: number = 1,
  perPage: number = 10
): Promise<StravaActivitiesResult> => {
  try {
    console.log(`Fetching activities for user: ${userId}, page: ${page}, perPage: ${perPage}`);
    
    const { data, error } = await supabase.functions.invoke<StravaActivity[]>(
      "strava-auth",
      {
        body: { 
          action: "get_activities",
          userId: userId,
          page: page,
          perPage: perPage
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
      console.log(`Fetched ${data.length} activities for page ${page}`);
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
export const getStravaActivities = async (
  userId: string,
  page: number = 1,
  perPage: number = 10
): Promise<StravaActivity[]> => {
  try {
    console.log(`Getting activities for user: ${userId}, page: ${page}, perPage: ${perPage}`);
    
    const { activities, error } = await fetchStravaActivities(userId, page, perPage);
    
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
    console.error("Error getting activities:", error);
    throw error;
  }
};

/**
 * Gets detailed information for a specific activity
 */
export const getStravaActivityDetails = async (userId: string, activityId: number): Promise<StravaActivityDetailsResult> => {
  try {
    console.log(`Fetching details for activity ${activityId}`);
    
    // First check if we have it stored
    const storedActivity = await getStravaActivityById(userId, activityId);
    
    if (storedActivity) {
      console.log("Retrieved activity from database");
      return { activity: storedActivity, error: null };
    }
    
    // If not stored, fetch from API
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

    // Make sure the API response has all required fields
    const fullActivity: SavedStravaActivity = {
      ...data,
      saved: isSaved,
      sport_type: data.sport_type || data.type,
      start_date_local: data.start_date_local || data.start_date,
      timezone: data.timezone || "",
      utc_offset: data.utc_offset || 0
    };

    return { activity: fullActivity, error: null };
  } catch (error: any) {
    console.error("Error fetching activity details:", error);
    return { 
      activity: null, 
      error: error.message || "Failed to fetch activity details"
    };
  }
};

/**
 * Fetches heart rate zones for a specific activity
 */
export const getActivityZones = async (userId: string, activityId: number): Promise<ActivityZones | null> => {
  try {
    console.log(`Fetching zones for activity ${activityId}`);
    
    const { data, error } = await supabase.functions.invoke(
      "strava-auth",
      {
        body: { 
          action: "get_activity_zones",
          userId: userId,
          activityId: activityId
        }
      }
    );

    if (error) {
      console.error("Strava function error:", error);
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error("Error fetching activity zones:", error);
    return null;
  }
};
