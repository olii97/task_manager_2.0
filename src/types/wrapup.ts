
export interface DailyWrapup {
  date: string;
  journal_entry: string | null;
  strava_activities: StravaActivitySummary[] | null;
  todo_list: {
    planned: string[];
    completed: string[];
  };
}

export interface StravaActivitySummary {
  activity_type: string;
  distance_km: number;
  duration: string;
  pace: string;
}
