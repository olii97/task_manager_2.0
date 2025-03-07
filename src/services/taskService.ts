
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/tasks';

export const markTaskComplete = async (taskId: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error marking task as complete:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error marking task as complete:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

export const getTasks = async (userId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching tasks:', error);
    return [];
  }
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<{ task: Task | null, error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return { task: null, error: error.message };
    }

    return { task: data, error: null };
  } catch (error) {
    console.error('Unexpected error creating task:', error);
    return { 
      task: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<{ success: boolean, error: string | null }> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error updating task:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

export const deleteTask = async (taskId: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error deleting task:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};
