
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { DailySummary, DailySummaryDownloadResult } from '@/types/wrapup';
import { Task } from '@/types/tasks';
import { JournalEntry } from '@/types/journal';
import { SavedStravaActivity } from '@/types/strava';
import { toast } from '@/components/ui/use-toast';

/**
 * Generates a daily summary for the specified date
 */
export const generateDailyWrapup = async (userId: string, date: string): Promise<DailySummary | null> => {
  try {
    console.log(`Generating daily wrapup for ${date}`);
    
    // Fetch journal entry for the day
    const { data: journalEntries, error: journalError } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date);
    
    if (journalError) {
      console.error("Error fetching journal entries:", journalError);
      throw journalError;
    }
    
    // Get completed tasks for the day
    const { data: completedTasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("is_completed", true)
      .gte("completion_date", `${date}T00:00:00`)
      .lt("completion_date", `${date}T23:59:59`);
    
    if (tasksError) {
      console.error("Error fetching completed tasks:", tasksError);
      throw tasksError;
    }
    
    // Get workouts for the day
    const { data: workouts, error: workoutsError } = await supabase
      .from("strava_activities")
      .select("*")
      .eq("user_id", userId)
      .gte("start_date", `${date}T00:00:00`)
      .lt("start_date", `${date}T23:59:59`);
    
    if (workoutsError) {
      console.error("Error fetching workouts:", workoutsError);
      throw workoutsError;
    }
    
    const journalEntry = journalEntries && journalEntries.length > 0 ? journalEntries[0] as unknown as JournalEntry : null;
    const tasks = completedTasks as unknown as Task[];
    
    // Convert database workouts to SavedStravaActivity format
    const formattedWorkouts = workouts ? workouts.map(workout => ({
      id: Number(workout.id),
      name: workout.name,
      type: workout.type,
      sport_type: workout.type,
      distance: workout.distance,
      moving_time: workout.moving_time,
      elapsed_time: workout.elapsed_time,
      total_elevation_gain: workout.total_elevation_gain || 0,
      start_date: workout.start_date,
      start_date_local: workout.start_date, // Use the same as start_date
      timezone: "", // Default empty
      utc_offset: 0, // Default to 0
      location_city: null,
      location_state: null,
      location_country: null,
      average_speed: workout.average_speed || 0,
      max_speed: workout.max_speed || 0,
      average_heartrate: workout.average_heartrate || 0,
      max_heartrate: workout.max_heartrate || 0,
      map: {
        id: workout.map_polyline ? `map_${workout.id}` : "",
        summary_polyline: workout.summary_polyline || "",
        resource_state: 2
      },
      saved: true
    })) : [];
    
    // Calculate stats
    const totalWorkoutMinutes = formattedWorkouts.reduce((total, workout) => total + Math.floor(workout.moving_time / 60), 0);
    
    const summary: DailySummary = {
      date: date,
      journalEntry: journalEntry,
      completedTasks: tasks,
      workouts: formattedWorkouts as SavedStravaActivity[],
      stats: {
        tasksCompleted: tasks.length,
        moodScore: journalEntry?.mood || null,
        energyLevel: journalEntry?.energy || null,
        workoutCount: formattedWorkouts.length,
        totalWorkoutMinutes: totalWorkoutMinutes
      }
    };
    
    // Save the summary to the database for future reference
    await supabase.from("daily_summaries").upsert({
      user_id: userId,
      date: date,
      summary_data: summary,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    return summary;
  } catch (error) {
    console.error("Error generating daily wrapup:", error);
    return null;
  }
};

/**
 * Downloads the daily summary as a JSON file
 */
export const downloadWrapupAsJson = (summary: DailySummary): void => {
  try {
    // Create a blob with the data
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    
    // Create a link element to trigger the download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `daily-summary-${summary.date}.json`;
    
    // Append to the document, click, and remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Success",
      description: "Daily summary downloaded successfully"
    });
  } catch (error) {
    console.error("Error downloading wrapup:", error);
    toast({
      title: "Error",
      description: "Failed to download summary",
      variant: "destructive"
    });
  }
};
