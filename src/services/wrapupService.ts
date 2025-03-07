
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Task } from '@/types/tasks';
import { JournalEntry, mapDatabaseEntryToJournalEntry } from '@/types/journal';
import { StravaActivity } from '@/types/strava';

export interface DailySummary {
  date: string;
  journalEntries: JournalEntry[];
  completedTasks: Task[];
  stravaActivities: StravaActivity[];
}

export const getDailySummary = async (userId: string, date: Date): Promise<DailySummary | null> => {
  try {
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Get journal entries for the day
    const { data: journalEntriesData, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .like('date', `${dateString}%`);
    
    if (journalError) {
      console.error('Error fetching journal entries:', journalError);
      return null;
    }
    
    // Get completed tasks for the day
    const { data: completedTasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .like('completion_date', `${dateString}%`);
    
    if (tasksError) {
      console.error('Error fetching completed tasks:', tasksError);
      return null;
    }
    
    // Get Strava activities for the day
    const { data: stravaActivitiesData, error: stravaError } = await supabase
      .from('strava_activities')
      .select('*')
      .eq('user_id', userId)
      .like('start_date', `${dateString}%`);
    
    if (stravaError) {
      console.error('Error fetching Strava activities:', stravaError);
      return null;
    }
    
    // Convert raw database entries to proper typed objects
    const journalEntries = (journalEntriesData || []).map(entry => mapDatabaseEntryToJournalEntry(entry));
    
    const completedTasks = (completedTasksData || []).map(task => ({
      ...task,
      priority: task.priority >= 1 && task.priority <= 4 ? (task.priority as 1|2|3|4) : 4
    }));
    
    // Transform Strava activities
    const stravaActivities = (stravaActivitiesData || []).map(activity => ({
      id: activity.id,
      name: activity.name,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time,
      type: activity.type,
      sport_type: activity.type,
      start_date: activity.start_date,
      start_date_local: activity.start_date,
      total_elevation_gain: activity.total_elevation_gain || 0,
      average_speed: activity.average_speed || 0,
      max_speed: activity.max_speed || 0,
      timezone: "",
      utc_offset: 0,
      saved: true
    } as StravaActivity));
    
    return {
      date: dateString,
      journalEntries,
      completedTasks,
      stravaActivities
    };
  } catch (error) {
    console.error('Unexpected error getting daily summary:', error);
    return null;
  }
};

export const saveDailySummary = async (userId: string, summary: {
  reflection: string,
  energy: number,
  mood: number,
  date: string
}): Promise<{ success: boolean, error: string | null }> => {
  try {
    // Since there's no daily_summaries table yet, we'll save this as a journal entry instead
    const { error } = await supabase
      .from('journal_entries')
      .insert([{
        user_id: userId,
        date: summary.date,
        reflection: summary.reflection,
        energy: summary.energy,
        mood: summary.mood,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Error saving daily summary:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error saving daily summary:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

export const generateDailySummaryPDF = async (userId: string, date: Date): Promise<{ url: string | null, error: string | null }> => {
  try {
    // This would typically call an edge function to generate a PDF
    // For now, we'll just return a mock response
    
    return { 
      url: `https://example.com/summaries/${userId}/${format(date, 'yyyy-MM-dd')}.pdf`, 
      error: null 
    };
  } catch (error) {
    console.error('Unexpected error generating daily summary PDF:', error);
    return { 
      url: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};
