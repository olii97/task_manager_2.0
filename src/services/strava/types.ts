
import { StravaActivity } from "@/types/strava";

// Internal types for Strava services
export interface StravaApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface StravaActivitiesResponse {
  activities: StravaActivity[];
  error: string | null;
}

export interface StravaConnectionResult {
  isConnected: boolean;
  error: string | null;
}

export interface StravaAuthUrlResult {
  url: string | null;
  error: string | null;
}

export interface StravaOperationResult {
  success: boolean;
  error: string | null;
}

export interface StravaActivityResult {
  activity: StravaActivity | null;
  error: string | null;
}
