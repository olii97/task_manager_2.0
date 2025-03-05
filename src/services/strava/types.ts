
import { StravaActivity, SavedStravaActivity } from "@/types/strava";

export interface StravaConnectionResult {
  isConnected: boolean;
  error: string | null;
}

export interface StravaActivitiesResult {
  activities: StravaActivity[];
  error: string | null;
}

export interface StravaActivityDetailsResult {
  activity: SavedStravaActivity | null;
  error: string | null;
}

export interface StravaActionResult {
  success: boolean;
  error: string | null;
}

export interface StravaAuthUrlResult {
  url: string | null;
  error: string | null;
}
