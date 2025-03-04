
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/tasks";
import { toast } from "@/hooks/use-toast";
import { addTaskCompletionXP } from "./taskXpService";

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }

    return data as Task[];
  } catch (error) {
    console.error("Error in fetchTasks:", error);
    throw error;
  }
};

export const addTask = async (
  userId: string,
  taskData: Omit<Task, "id" | "created_at" | "updated_at">
): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        ...taskData,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error adding task:", error);
      throw error;
    }

    toast({
      title: "Task added",
      description: "Your task has been added successfully.",
    });

    return data as Task;
  } catch (error) {
    console.error("Error in addTask:", error);
    throw error;
  }
};

export const updateTask = async (
  taskId: string,
  updates: Partial<Task>
): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating task:", error);
      throw error;
    }

    return data as Task;
  } catch (error) {
    console.error("Error in updateTask:", error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      throw error;
    }

    toast({
      title: "Task deleted",
      description: "Your task has been deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteTask:", error);
    throw error;
  }
};
