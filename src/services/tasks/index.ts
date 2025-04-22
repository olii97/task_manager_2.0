import { supabase } from "@/supabaseClient";
import { Task, TaskCategory } from "@/types/tasks";

export const addTask = async (userId: string, task: Omit<Task, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert([{
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        is_completed: task.is_completed,
        is_scheduled_today: task.is_scheduled_today,
        energy_level: task.energy_level,
        category: task.category,
        user_id: userId,
        project_id: task.project_id,
        due_date: task.due_date,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding task:", error);
    throw error;
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        title: updates.title,
        description: updates.description,
        priority: updates.priority,
        is_completed: updates.is_completed,
        is_scheduled_today: updates.is_scheduled_today,
        energy_level: updates.energy_level,
        category: updates.category,
        project_id: updates.project_id,
        completion_date: updates.is_completed ? new Date().toISOString() : null,
        due_date: updates.due_date,
      })
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export * from './taskBasicService';
export * from './taskStatusService';
export * from './taskBatchService';
export * from './taskXpService';
