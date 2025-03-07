
import { Task } from './tasks';
import { JournalEntry } from './journal';
import { SavedStravaActivity } from './strava';

export interface DailySummary {
  date: string;
  journalEntry: JournalEntry | null;
  completedTasks: Task[];
  workouts: SavedStravaActivity[];
  stats: {
    tasksCompleted: number;
    moodScore: number | null;
    energyLevel: number | null;
    workoutCount: number;
    totalWorkoutMinutes: number;
  };
}

export interface DailySummaryDownloadResult {
  success: boolean;
  error: string | null;
  data?: DailySummary;
}
