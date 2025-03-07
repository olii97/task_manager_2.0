
import { Task } from './tasks';
import { JournalEntry } from './journal';

export interface StravaActivitySummary {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_heartrate: number;
  max_heartrate: number;
  summary_polyline: string;
}

export interface DailySummary {
  id: string;
  user_id: string;
  date: string;
  tasks_completed: number;
  tasks: Task[];
  journal_entry: JournalEntry | null;
  pomodoro_sessions: number;
  pomodoro_minutes: number;
  strava_activities: StravaActivitySummary[];
  created_at: string;
}
