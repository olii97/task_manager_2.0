
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/tasks";
import { addTaskCompletionXP } from "./taskXpService";

export const completeTask = async (
  taskId: string,
  isCompleted: boolean
): Promise<Task> => {
  try {
    const updates: Partial<Task> = {
      is_completed: isCompleted,
      completion_date: isCompleted ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select("*")
      .single();

    if (error) {
      console.error("Error completing task:", error);
      throw error;
    }

    // Add XP if task is completed and is P1
    if (isCompleted && data.priority === 1) {
      await addTaskCompletionXP(data.user_id, data.title);
    }

    return data as Task;
  } catch (error) {
    console.error("Error in completeTask:", error);
    throw error;
  }
};

export const scheduleTaskForToday = async (
  taskId: string,
  isScheduled: boolean,
  energyLevel?: 'high' | 'low'
): Promise<Task> => {
  try {
    const updates: Partial<Task> = {
      is_scheduled_today: isScheduled,
      energy_level: energyLevel || null,
    };

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select("*")
      .single();

    if (error) {
      console.error("Error scheduling task:", error);
      throw error;
    }

    return data as Task;
  } catch (error) {
    console.error("Error in scheduleTaskForToday:", error);
    throw error;
  }
};
