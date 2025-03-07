
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Task } from '@/types/tasks';
import { JournalEntry } from '@/types/journal';
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
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .like('date', `${dateString}%`);
    
    if (journalError) {
      console.error('Error fetching journal entries:', journalError);
      return null;
    }
    
    // Get completed tasks for the day
    const { data: completedTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .like('completed_at', `${dateString}%`);
    
    if (tasksError) {
      console.error('Error fetching completed tasks:', tasksError);
      return null;
    }
    
    // Get Strava activities for the day
    const { data: stravaActivities, error: stravaError } = await supabase
      .from('strava_activities')
      .select('data')
      .eq('user_id', userId)
      .like('created_at', `${dateString}%`);
    
    if (stravaError) {
      console.error('Error fetching Strava activities:', stravaError);
      return null;
    }
    
    // Transform Strava activities to match the expected format
    const transformedActivities = stravaActivities.map(record => ({
      ...record.data,
      saved: true
    }));
    
    return {
      date: dateString,
      journalEntries: journalEntries || [],
      completedTasks: completedTasks || [],
      stravaActivities: transformedActivities || []
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
    const { error } = await supabase
      .from('daily_summaries')
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
