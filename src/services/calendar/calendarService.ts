import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface CalendarEntry {
  id: string;
  user_id: string;
  date: string;
  entry_type: 'work' | 'personal';
  title: string;
  description?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  is_recurring: boolean;
  recurrence_pattern?: string;
  created_at: string;
  updated_at: string;
}

export type NewCalendarEntry = Omit<CalendarEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

/**
 * Fetch calendar entries for a given user within a date range
 */
export const fetchCalendarEntries = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('calendar_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching calendar entries:', error);
      throw error;
    }

    return data as CalendarEntry[];
  } catch (error) {
    console.error('Error in fetchCalendarEntries:', error);
    throw error;
  }
};

/**
 * Add a new calendar entry
 */
export const addCalendarEntry = async (
  userId: string,
  entry: NewCalendarEntry
): Promise<CalendarEntry> => {
  try {
    const { data, error } = await supabase
      .from('calendar_entries')
      .insert({
        ...entry,
        user_id: userId,
        status: entry.status || 'pending'
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error adding calendar entry:', error);
      throw error;
    }

    toast({
      title: "Entry added",
      description: "Your calendar entry has been added successfully."
    });

    return data as CalendarEntry;
  } catch (error) {
    console.error('Error in addCalendarEntry:', error);
    throw error;
  }
};

/**
 * Update an existing calendar entry
 */
export const updateCalendarEntry = async (
  entryId: string,
  updates: Partial<CalendarEntry>
): Promise<CalendarEntry> => {
  try {
    const { data, error } = await supabase
      .from('calendar_entries')
      .update(updates)
      .eq('id', entryId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating calendar entry:', error);
      throw error;
    }

    return data as CalendarEntry;
  } catch (error) {
    console.error('Error in updateCalendarEntry:', error);
    throw error;
  }
};

/**
 * Update the status of a calendar entry
 */
export const updateCalendarEntryStatus = async (
  entryId: string,
  status: 'pending' | 'completed' | 'cancelled'
): Promise<CalendarEntry> => {
  return updateCalendarEntry(entryId, { status });
};

/**
 * Delete a calendar entry
 */
export const deleteCalendarEntry = async (entryId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('calendar_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('Error deleting calendar entry:', error);
      throw error;
    }

    toast({
      title: "Entry deleted",
      description: "Your calendar entry has been deleted successfully."
    });
  } catch (error) {
    console.error('Error in deleteCalendarEntry:', error);
    throw error;
  }
}; 