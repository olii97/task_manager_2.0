
export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset?: number;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  map?: {
    id: string;
    summary_polyline: string;
    resource_state: number;
  };
  trainer?: boolean;
  commute?: boolean;
  manual?: boolean;
  private?: boolean;
  visibility?: string;
  average_cadence?: number;
  average_watts?: number;
  kilojoules?: number;
  description?: string | null;
  gear_id?: string | null;
  average_temp?: number;
  average_watts_weighted?: number;
  display_hide_heartrate_zone?: boolean;
  laps?: StravaLap[];
  splits_metric?: StravaSplit[];
  splits_standard?: StravaSplit[];
  segment_efforts?: StravaSegmentEffort[];
  start_latlng?: [number, number];
  end_latlng?: [number, number];
  calories?: number;
  device_name?: string;
  pr_count?: number;
  max_watts?: number;
  max_cadence?: number;
  elevation_high?: number;
  elevation_low?: number;
  kudos_count?: number;
  achievement_count?: number;
  athlete?: { id: number };
}

export interface StravaLap {
  id: number;
  lap_index: number;
  name?: string;
  split: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  average_speed: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  pace_zone?: number;
}

export interface StravaSplit {
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  moving_time: number;
  split: number;
  average_speed: number;
  pace_zone?: number;
}

export interface StravaSegmentEffort {
  id: number;
  name: string;
  elapsed_time: number;
  moving_time: number;
  distance: number;
  start_date: string;
  start_date_local: string;
  is_kom?: boolean;
}

// Instead of extending with Partial<StravaActivity>, we'll define SavedStravaActivity 
// with the exact required fields and make optional fields properly marked
export interface SavedStravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number; // Now required to match StravaActivity
  type: string;
  start_date: string;
  start_date_local: string; // Required
  timezone?: string; // Optional but included
  average_speed: number;
  max_speed: number;
  total_elevation_gain?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  device_name?: string;
  map?: {
    id: string;
    summary_polyline: string;
    resource_state: number;
  };
  saved: boolean;
  // Adding missing fields that are used in the app
  utc_offset?: number;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  kudos_count?: number;
  achievement_count?: number;
}

// Updated conversion function that ensures all required fields are included
export function toSavedStravaActivity(activity: StravaActivity, isSaved: boolean = false): SavedStravaActivity {
  return {
    id: activity.id,
    name: activity.name,
    distance: activity.distance,
    moving_time: activity.moving_time,
    elapsed_time: activity.elapsed_time,
    type: activity.type,
    start_date: activity.start_date,
    start_date_local: activity.start_date_local,
    timezone: activity.timezone,
    average_speed: activity.average_speed,
    max_speed: activity.max_speed,
    total_elevation_gain: activity.total_elevation_gain,
    average_heartrate: activity.average_heartrate,
    max_heartrate: activity.max_heartrate,
    average_cadence: activity.average_cadence,
    device_name: activity.device_name,
    map: activity.map,
    utc_offset: activity.utc_offset,
    location_city: activity.location_city,
    location_state: activity.location_state,
    location_country: activity.location_country,
    kudos_count: activity.kudos_count,
    achievement_count: activity.achievement_count,
    saved: isSaved
  };
}
