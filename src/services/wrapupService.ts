import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';

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

    return data as Task[];
  } catch (error) {
    console.error('Unexpected error fetching tasks:', error);
    return [];
  }
};

export const getScheduledTasksForToday = async (userId: string): Promise<Task[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('scheduled_for', today)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching scheduled tasks for today:', error);
      return [];
    }

    return data as Task[];
  } catch (error) {
    console.error('Unexpected error fetching scheduled tasks for today:', error);
    return [];
  }
};

export const addTask = async (task: Omit<Task, 'id' | 'created_at'>): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select('*')
      .single();

    if (error) {
      console.error('Error adding task:', error);
      return null;
    }

    return data as Task;
  } catch (error) {
    console.error('Unexpected error adding task:', error);
    return null;
  }
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return null;
    }

    return data as Task;
  } catch (error) {
    console.error('Unexpected error updating task:', error);
    return null;
  }
};

export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting task:', error);
    return false;
  }
};

export const wrapupDay = async (userId: string): Promise<{ task_ids: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('wrapup-day', {
      body: { user_id: userId },
    });

    if (error) {
      console.error('Function invocation error:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('No data received from function');
    }

    const taskIds = String(data.task_ids);

    return { task_ids: taskIds };
  } catch (error) {
    console.error('Error in wrapupDay:', error);
    throw error;
  }
};
