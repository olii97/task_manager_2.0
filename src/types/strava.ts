
export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date_local: string;
  
  // Add additional fields needed by the ActivityItem component
  start_date: string;
  location_city?: string;
  location_state?: string;
  average_speed?: number;
  total_elevation_gain?: number;
  average_heartrate?: number;
}
