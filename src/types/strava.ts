
export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  kudos_count?: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  achievement_count?: number;
  average_speed?: number;
  max_speed?: number;
  average_watts?: number;
  has_heartrate?: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  elev_high?: number;
  elev_low?: number;
  pr_count?: number;
  map?: {
    id: string;
    summary_polyline?: string;
    polyline?: string;
    resource_state?: number;
  };
  gear?: {
    id: string;
    name: string;
  };
  splits_metric?: any[];
  splits_standard?: any[];
  laps?: any[];
  segment_efforts?: any[];
  photos?: {
    primary?: {
      id: number;
      source: number;
      unique_id: string;
      urls: Record<string, string>;
    };
  };
  saved?: boolean;
  // Additional properties required by StravaPerformanceMetrics
  average_cadence?: number;
  average_watts_weighted?: number;
  kilojoules?: number;
  calories?: number;
  average_temp?: number;
  elevation_high?: number;
  elevation_low?: number;
}

export interface SavedStravaActivity extends StravaActivity {
  saved: boolean;
}

export interface StravaConnectionStatus {
  isConnected: boolean;
  error?: string;
}

export interface StravaProfile {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  profile_medium: string;
  profile: string;
  created_at: string;
  updated_at: string;
}

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Improved helper function to convert StravaActivity to SavedStravaActivity
export const toSavedStravaActivity = (activity: StravaActivity, isSaved: boolean = false): SavedStravaActivity => {
  // Ensure all required fields are present
  const savedActivity: SavedStravaActivity = {
    ...activity,
    // Required properties for SavedStravaActivity
    saved: isSaved,
    // Ensure these required fields have default values if they're missing
    sport_type: activity.sport_type || activity.type || "unknown",
    start_date_local: activity.start_date_local || activity.start_date || new Date().toISOString(),
    timezone: activity.timezone || "",
    utc_offset: activity.utc_offset || 0
  };
  
  return savedActivity;
};
