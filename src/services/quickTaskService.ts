import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskCategory, TaskType } from "@/types/tasks";
import { Project } from "@/types/projects";
import { getOpenAIClient } from './openaiClientService';

// Get the client-side API key from environment variables
const CLIENT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 
                      import.meta.env.VITE_OPENAI_CLIENT_KEY || 
                      import.meta.env.REACT_APP_OPENAI_CLIENT_KEY;

const SYSTEM_PROMPT = `You are a task analyzer that helps categorize and structure tasks. 
Given a task description, analyze it and return a structured response with the following:

1. A clear, concise title
2. A more detailed description (if needed)
3. Priority level (1-4, where 1 is highest priority)
4. Energy level required (high/low)
5. Category (must be one of: Consume, Create, Care, Connect)
6. Task Type (must be either: work, personal)

Categories are defined as:
- Consume: Tasks involving learning, reading, watching, or absorbing information
- Create: Tasks involving making, building, writing, or producing something
- Care: Tasks involving self-care, maintenance, or organization
- Connect: Tasks involving communication, relationships, or collaboration

Task Types are defined as:
- work: Tasks related to your job, professional development, or business
- personal: Tasks related to your personal life, hobbies, family, or self-improvement

Format your response as JSON with these fields:
{
  "title": string,
  "description": string | null,
  "priority": number (1-4),
  "energy_level": "high" | "low",
  "category": "Consume" | "Create" | "Care" | "Connect",
  "task_type": "work" | "personal"
}`;

export async function analyzeTaskText(text: string, projects: Project[] = []): Promise<Omit<Task, "id" | "created_at" | "updated_at">> {
  console.log('Starting task analysis for:', text);
  
  try {
    const openai = await getOpenAIClient();
    console.log('OpenAI client initialized:', !!openai);
    
    if (!openai) {
      console.warn('OpenAI client not available, using fallback behavior');
      toast({
        title: "AI Analysis Unavailable",
        description: "Using default task settings. Please check your OpenAI API key configuration.",
        variant: "destructive",
      });
      return {
        title: text,
        description: '',
        priority: 4,
        energy_level: 'low',
        category: 'Create' as TaskCategory,
        task_type: 'personal' as TaskType,
        is_completed: false,
        is_scheduled_today: false,
        user_id: '', // This will be set by the task service
      };
    }

    console.log('Sending request to OpenAI with prompt:', SYSTEM_PROMPT);
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text }
      ],
      temperature: 0.3,
    });

    console.log('Received response from OpenAI:', completion.choices[0].message.content);
    const result = JSON.parse(completion.choices[0].message.content || '{}');
    console.log('Parsed result:', result);

    const taskData = {
      title: result.title || text,
      description: result.description || '',
      priority: result.priority || 4,
      energy_level: result.energy_level || 'low',
      category: result.category || 'Create',
      task_type: result.task_type || 'personal',
      is_completed: false,
      is_scheduled_today: false,
      user_id: '', // This will be set by the task service
    };
    
    console.log('Final task data:', taskData);
    toast({
      title: "Task Analyzed",
      description: "AI has analyzed and structured your task.",
    });
    return taskData;
  } catch (error) {
    console.error('Error analyzing task:', error);
    toast({
      title: "AI Analysis Failed",
      description: "Could not analyze task with AI. Using default settings.",
      variant: "destructive",
    });
    return {
      title: text,
      description: '',
      priority: 4,
      energy_level: 'low',
      category: 'Create' as TaskCategory,
      task_type: 'personal' as TaskType,
      is_completed: false,
      is_scheduled_today: false,
      user_id: '', // This will be set by the task service
    };
  }
} 