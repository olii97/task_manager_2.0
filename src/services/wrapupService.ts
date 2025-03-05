import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { DailyWrapup, StravaActivitySummary } from "@/types/wrapup";
import { JournalEntry } from "@/types/journal";
import { Task } from "@/types/tasks";
import { StravaActivity } from "@/types/strava";
import { formatDistance, formatTime, formatPace } from "@/utils/formatters";

export const generateDailyWrapup = async (userId: string): Promise<DailyWrapup> => {
  const today = format(new Date(), "yyyy-MM-dd");
  
  // Fetch today's journal entry
  const journalEntry = await fetchTodaysJournalEntry(userId, today);
  
  // Fetch today's Strava activities
  const stravaActivities = await fetchTodaysStravaActivities(userId, today);
  
  // Fetch today's tasks
  const tasks = await fetchTodaysTasks(userId);
  
  // Create the daily wrap-up object
  const wrapup: DailyWrapup = {
    date: today,
    journal_entry: journalEntry?.reflection || getJournalContent(journalEntry) || null,
    strava_activities: stravaActivities.length > 0 
      ? stravaActivities.map(mapStravaActivityToSummary) 
      : null,
    todo_list: {
      planned: tasks.filter(task => task.is_scheduled_today).map(task => task.title),
      completed: tasks.filter(task => task.is_completed && task.completion_date && 
        task.completion_date.startsWith(today)).map(task => task.title)
    }
  };
  
  return wrapup;
};

// Helper function to fetch today's journal entry
const fetchTodaysJournalEntry = async (userId: string, today: string): Promise<JournalEntry | null> => {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (error || !data) {
    console.error("Error fetching journal entry:", error);
    return null;
  }
  
  return data as JournalEntry;
};

// Helper function to fetch today's Strava activities
const fetchTodaysStravaActivities = async (userId: string, today: string): Promise<StravaActivity[]> => {
  const { data, error } = await supabase
    .from("strava_activities")
    .select("*")
    .eq("user_id", userId)
    .gte("start_date", `${today}T00:00:00Z`)
    .lte("start_date", `${today}T23:59:59Z`)
    .order("start_date", { ascending: false });
    
  if (error || !data) {
    console.error("Error fetching Strava activities:", error);
    return [];
  }
  
  // Convert database records to StravaActivity type
  return data.map(activity => {
    return {
      id: activity.id,
      name: activity.name,
      type: activity.type,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time,
      total_elevation_gain: activity.total_elevation_gain || 0,
      start_date: activity.start_date,
      start_date_local: activity.start_date, // Use start_date as start_date_local
      timezone: "", // Default empty timezone
      utc_offset: 0, // Default value
      average_speed: activity.average_speed || 0,
      max_speed: activity.max_speed || 0,
      average_heartrate: activity.average_heartrate || 0,
      max_heartrate: activity.max_heartrate || 0,
      map: {
        id: activity.map_id || '',
        summary_polyline: activity.summary_polyline || '',
        resource_state: 2,
      },
      trainer: false,
      commute: false,
      manual: false,
      private: false,
      visibility: '',
      average_cadence: activity.average_cadence || 0,
      average_watts: activity.average_watts || 0,
      kilojoules: activity.kilojoules || 0,
      description: null,
      gear_id: activity.gear_id,
      average_temp: activity.temperature || 0,
      average_watts_weighted: activity.weighted_average_watts || 0,
      display_hide_heartrate_zone: false,
    } as StravaActivity;
  });
};

// Helper function to fetch today's tasks
const fetchTodaysTasks = async (userId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId);
    
  if (error || !data) {
    console.error("Error fetching tasks:", error);
    return [];
  }
  
  return data as Task[];
};

// Helper function to map Strava activity to summary
const mapStravaActivityToSummary = (activity: StravaActivity): StravaActivitySummary => {
  return {
    activity_type: activity.type,
    distance_km: parseFloat((activity.distance / 1000).toFixed(2)),
    duration: formatTime(activity.moving_time),
    pace: formatPace(activity.average_speed)
  };
};

// Helper function to get content from journal entry
const getJournalContent = (entry: JournalEntry | null): string | null => {
  if (!entry) return null;
  
  // If we have reflections array, concatenate them
  if (entry.reflections && entry.reflections.length > 0) {
    return entry.reflections.map(r => r.content).join("\n\n");
  }
  
  // Otherwise use the main reflection
  return entry.reflection || null;
};

// Function to download the wrap-up as a JSON file
export const downloadWrapupAsJson = (wrapup: DailyWrapup) => {
  const fileName = `daily-wrapup-${wrapup.date}.json`;
  const jsonStr = JSON.stringify(wrapup, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  
  // Create a download link and trigger it
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
