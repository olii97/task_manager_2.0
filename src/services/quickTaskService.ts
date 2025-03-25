import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/tasks";

// Get the client-side API key from environment variables
const CLIENT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 
                      import.meta.env.VITE_OPENAI_CLIENT_KEY || 
                      import.meta.env.REACT_APP_OPENAI_CLIENT_KEY;

export const analyzeTaskText = async (taskText: string): Promise<Omit<Task, "id" | "created_at" | "updated_at">> => {
  if (!CLIENT_API_KEY) {
    toast({
      title: "API Key Missing",
      description: "OpenAI API key is missing in your environment variables.",
      variant: "destructive",
    });
    throw new Error("API key is missing. Please check your environment variables.");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CLIENT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a task management assistant. Analyze the user's task description and extract structured information.
            Format your response as JSON with the following fields:
            {
              "title": "Brief, clear task title",
              "description": "Detailed description if available",
              "priority": number from 1-4 (1 is highest priority, must do today; 4 is lowest, backlog/no deadline),
              "is_completed": false,
              "is_scheduled_today": boolean based on urgency,
              "energy_level": "high" or "low" based on task complexity and mental effort required
            }
            
            Be conservative with priority 1 - only assign it if the task is explicitly urgent or due today.
            For energy level, consider "high" for tasks requiring focus, creativity, or complex decision making,
            and "low" for routine, administrative, or mechanical tasks.`
          },
          {
            role: "user",
            content: taskText
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`Error from OpenAI API: ${response.statusText}`);
    }

    const data = await response.json();
    const taskData = JSON.parse(data.choices[0].message.content);
    
    // Validate the required fields
    if (!taskData.title) {
      throw new Error("Task analysis missing title");
    }
    
    // Default values for missing fields
    if (taskData.priority === undefined) taskData.priority = 4;
    if (taskData.is_completed === undefined) taskData.is_completed = false;
    if (taskData.is_scheduled_today === undefined) taskData.is_scheduled_today = false;
    
    // Ensure priority is a valid value
    taskData.priority = Number(taskData.priority);
    if (![1, 2, 3, 4].includes(taskData.priority)) {
      taskData.priority = 4; // Default to lowest priority if invalid
    }
    
    // Return the validated task data
    return {
      title: taskData.title,
      description: taskData.description || "",
      priority: taskData.priority as 1 | 2 | 3 | 4,
      energy_level: taskData.energy_level as 'high' | 'low' | undefined,
      is_completed: false,
      is_scheduled_today: taskData.is_scheduled_today,
    };
  } catch (error) {
    console.error("Error analyzing task:", error);
    toast({
      title: "Error",
      description: "Failed to analyze task text. Please try again or create manually.",
      variant: "destructive",
    });
    throw error;
  }
}; 