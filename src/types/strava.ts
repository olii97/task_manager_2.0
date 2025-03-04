
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
  utc_offset: number;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  average_speed: number;
  max_speed: number;
  average_heartrate: number;
  max_heartrate: number;
  map: {
    id: string;
    summary_polyline: string;
    resource_state: number;
  };
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  visibility: string;
  average_cadence: number;
  average_watts: number;
  kilojoules: number;
  description: string | null;
  gear_id: string | null;
  average_temp: number;
  average_watts_weighted: number;
  display_hide_heartrate_zone: boolean;
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

export interface SavedStravaActivity extends StravaActivity {
  saved: boolean;
}

// Add a utility function to convert StravaActivity to SavedStravaActivity
export function toSavedStravaActivity(activity: StravaActivity, isSaved: boolean = false): SavedStravaActivity {
  return {
    ...activity,
    saved: isSaved
  };
}
