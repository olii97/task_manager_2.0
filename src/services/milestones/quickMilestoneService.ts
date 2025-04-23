import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, parseISO, startOfDay } from "date-fns";
import { getOpenAIClient } from '../openaiClientService';
import { Milestone } from "@/types/milestones";

const SYSTEM_PROMPT = `You are a milestone analyzer that helps structure project milestones. 
Given a milestone description, analyze it and return a structured response with the following:

1. A clear, concise title
2. A more detailed description (if needed)
3. Due date (if specified, otherwise use today's date)
4. Whether this is a main milestone (true/false)
5. Whether this is a recurring milestone (true/false)
6. Recurrence pattern (if recurring: daily, weekly, monthly, or yearly)

Format your response as JSON with these fields:
{
  "title": string,
  "description": string | null,
  "date": string (YYYY-MM-DD format),
  "is_main": boolean,
  "is_recurring": boolean,
  "recurrence_pattern": "daily" | "weekly" | "monthly" | "yearly" | null
}

Examples:
Input: "Complete project documentation by next Friday"
Output: {
  "title": "Complete project documentation",
  "description": null,
  "date": "2024-03-22",
  "is_main": false,
  "is_recurring": false,
  "recurrence_pattern": null
}

Input: "Major milestone: Launch beta version on April 1st"
Output: {
  "title": "Launch beta version", 
  "description": "Major project milestone for beta release",
  "date": "2024-04-01",
  "is_main": true,
  "is_recurring": false,
  "recurrence_pattern": null
}

Input: "Weekly progress review meeting every Monday"
Output: {
  "title": "Weekly Progress Review",
  "description": "Regular team progress review meeting",
  "date": "2024-03-18",
  "is_main": false,
  "is_recurring": true,
  "recurrence_pattern": "weekly"
}`;

/**
 * Convert a Date to YYYY-MM-DD format in local timezone
 */
const formatDateToLocalDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export async function analyzeMilestoneText(
  text: string, 
  projectId: string,
  userId: string
): Promise<Omit<Milestone, "id" | "created_at" | "updated_at">> {
  try {
    const openai = await getOpenAIClient();
    console.log('OpenAI client initialized:', !!openai);
    
    if (!openai) {
      console.warn('OpenAI client not available, using fallback behavior');
      toast({
        title: "AI Analysis Unavailable",
        description: "Using default milestone settings. Please check your OpenAI API key configuration.",
        variant: "destructive",
      });
      return {
        title: text,
        description: '',
        date: formatDateToLocalDate(new Date()),
        is_completed: false,
        is_main: false,
        recurring: false,
        project_id: projectId,
        user_id: userId,
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

    const milestoneData = {
      title: result.title || text,
      description: result.description || '',
      date: result.date || formatDateToLocalDate(new Date()),
      is_completed: false,
      is_main: result.is_main || false,
      recurring: result.is_recurring || false,
      recurrence_pattern: result.is_recurring ? result.recurrence_pattern : undefined,
      project_id: projectId,
      user_id: userId,
    };
    
    console.log('Final milestone data:', milestoneData);
    toast({
      title: "Milestone Analyzed",
      description: "AI has analyzed and structured your milestone.",
    });
    return milestoneData;
  } catch (error) {
    console.error('Error analyzing milestone:', error);
    toast({
      title: "AI Analysis Failed",
      description: "Could not analyze milestone with AI. Using default settings.",
      variant: "destructive",
    });
    return {
      title: text,
      description: '',
      date: formatDateToLocalDate(new Date()),
      is_completed: false,
      is_main: false,
      recurring: false,
      project_id: projectId,
      user_id: userId,
    };
  }
}

/* NEW: Bulk Milestone Analysis Function */
export async function analyzeBulkMilestonesText(
  text: string,
  projectId: string,
  userId: string
): Promise<Omit<Milestone, "id" | "created_at" | "updated_at">[]> {
  const BULK_SYSTEM_PROMPT = `You are a milestone analyzer that helps structure multiple project milestones in bulk.
Given several bullet points (each on a new line), analyze each bullet point and return a JSON array where each element is an object with the following keys:
{
  "title": string,
  "description": string | null,
  "date": string (YYYY-MM-DD format),
  "is_main": boolean,
  "is_recurring": boolean,
  "recurrence_pattern": "daily" | "weekly" | "monthly" | "yearly" | null
}

If a bullet point lacks sufficient detail, use default values (title: bullet point text, description: "", date: today, is_main: false, is_recurring: false).
Your output must be valid JSON and should not include any markdown formatting.`;
  
  try {
    const openai = await getOpenAIClient();
    console.log('OpenAI client initialized for bulk analysis:', !!openai);
    
    if (!openai) {
      console.warn('OpenAI client not available, using fallback behavior');
      toast({
        title: "AI Analysis Unavailable",
        description: "Using default milestone settings for bulk add. Please check your OpenAI API key configuration.",
        variant: "destructive",
      });
      const bulletPoints = text.split('\n').filter(line => line.trim().length > 0);
      return bulletPoints.map(bp => ({
        title: bp.trim(),
        description: '',
        date: formatDateToLocalDate(new Date()),
        is_completed: false,
        is_main: false,
        recurring: false,
        project_id: projectId,
        user_id: userId,
      }));
    }
    
    console.log('Sending bulk request to OpenAI with prompt:', BULK_SYSTEM_PROMPT);
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: BULK_SYSTEM_PROMPT },
        { role: "user", content: text }
      ],
      temperature: 0.3,
    });

    console.log('Received bulk response from OpenAI:', completion.choices[0].message.content);
    let milestones = [];
    try {
      milestones = JSON.parse(completion.choices[0].message.content || '[]');
      if (!Array.isArray(milestones)) {
        milestones = [];
      }
    } catch (jsonError) {
      console.error('Error parsing JSON for bulk milestones:', jsonError);
      milestones = [];
    }

    toast({
      title: "Bulk Milestone Analysis Complete",
      description: "AI has analyzed and structured your milestones.",
    });

    return milestones.map(milestone => ({
      title: milestone.title,
      description: milestone.description || '',
      date: milestone.date || formatDateToLocalDate(new Date()),
      is_completed: false,
      is_main: milestone.is_main || false,
      recurring: milestone.is_recurring || false,
      recurrence_pattern: milestone.is_recurring ? milestone.recurrence_pattern : undefined,
      project_id: projectId,
      user_id: userId,
    }));
  } catch (error) {
    console.error('Error analyzing bulk milestones:', error);
    toast({
      title: "AI Bulk Analysis Failed",
      description: "Could not analyze bulk milestones with AI. Using fallback for each bullet point.",
      variant: "destructive",
    });
    const bulletPoints = text.split('\n').filter(line => line.trim().length > 0);
    return bulletPoints.map(bp => ({
      title: bp.trim(),
      description: '',
      date: formatDateToLocalDate(new Date()),
      is_completed: false,
      is_main: false,
      recurring: false,
      project_id: projectId,
      user_id: userId,
    }));
  }
} 