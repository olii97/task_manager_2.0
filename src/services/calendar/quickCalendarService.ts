import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, addDays, nextMonday, parseISO, startOfDay, formatISO } from "date-fns";
import { NewCalendarEntry } from "./calendarService";

// Get the client-side API key - we'll try both formats
const CLIENT_KEY = import.meta.env.VITE_OPENAI_CLIENT_KEY || 
                  import.meta.env.VITE_OPENAI_API_KEY ||
                  import.meta.env.REACT_APP_OPENAI_CLIENT_KEY;

/**
 * Convert a Date to YYYY-MM-DD format in local timezone
 */
const formatDateToLocalDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const analyzeCalendarText = async (calendarText: string): Promise<NewCalendarEntry> => {
  if (!CLIENT_KEY) {
    toast({
      title: "API Key Missing",
      description: "OpenAI API key is missing in your environment variables.",
      variant: "destructive",
    });
    throw new Error("API key is missing. Please check your environment variables.");
  }

  try {
    // Get today's date in local timezone
    const today = startOfDay(new Date());
    const todayFormatted = formatDateToLocalDate(today);
    const todayReadable = format(today, "EEEE, MMMM d, yyyy");
    
    // Calculate tomorrow and next Monday in local timezone
    const tomorrow = addDays(today, 1);
    const nextMondayDate = nextMonday(today);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CLIENT_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a calendar assistant. Extract structured information from the user's input.
            
            Today's date is ${todayReadable} (${todayFormatted}).
            
            Return JSON with: 
            - title: Brief, clear title
            - description: Additional details (if any)
            - date: In YYYY-MM-DD format (use today's date if not specified)
            - entry_type: "work" for professional activities or "personal" for personal events
            - is_recurring: boolean indicating if it's a repeating event
            - recurrence_pattern: "daily", "weekly", "monthly", or "yearly" (if is_recurring is true)
            - has_reminder: boolean indicating if a reminder should be set
            - reminder_days_before: Number of days before the event to remind the user (if has_reminder is true)
            
            When user mentions days like "tomorrow", "next Monday", or "in 2 weeks", calculate the correct date based on today.
            When only time is mentioned (e.g., "at 3pm"), use today's date.
            If the user mentions wanting a reminder or being reminded, set has_reminder to true.
            If a specific reminder time is mentioned (like "remind me 3 days before"), set reminder_days_before accordingly.
            
            Examples (assuming today is ${todayReadable}):
            Input: "Doctor appointment tomorrow at 2pm"
            Output: {
              "title": "Doctor appointment",
              "description": "At 2pm",
              "date": "${formatDateToLocalDate(tomorrow)}",
              "entry_type": "personal",
              "is_recurring": false,
              "has_reminder": false
            }
            
            Input: "Weekly team meeting every Monday at 10am"
            Output: {
              "title": "Weekly team meeting",
              "description": "At 10am",
              "date": "${formatDateToLocalDate(nextMondayDate)}",
              "entry_type": "work",
              "is_recurring": true,
              "recurrence_pattern": "weekly",
              "has_reminder": false
            }
            
            Input: "Buy groceries this evening and remind me"
            Output: {
              "title": "Buy groceries",
              "description": "This evening",
              "date": "${todayFormatted}",
              "entry_type": "personal",
              "is_recurring": false,
              "has_reminder": true,
              "reminder_days_before": 0
            }
            
            Input: "Presentation due in 2 weeks, remind me 3 days before"
            Output: {
              "title": "Presentation due",
              "description": "",
              "date": "${formatDateToLocalDate(addDays(today, 14))}",
              "entry_type": "work",
              "is_recurring": false,
              "has_reminder": true,
              "reminder_days_before": 3
            }
            
            Now analyze the following input:`
          },
          { role: "user", content: calendarText }
        ],
        temperature: 0.5,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`Failed to analyze calendar text. API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Unexpected response format from OpenAI API");
    }
    
    const parsedResponse = JSON.parse(data.choices[0].message.content);
    console.log("API response:", parsedResponse);
    
    // Parse the date string in local timezone
    let eventDate: Date;
    try {
      // First convert the date string to a Date object in local timezone
      const dateStr = parsedResponse.date || todayFormatted;
      eventDate = parseISO(dateStr);
      
      // Ensure we're working with the start of the day in local timezone
      eventDate = startOfDay(eventDate);
    } catch (error) {
      console.error("Error parsing date:", error);
      eventDate = today;
    }
    
    // Format the date back to YYYY-MM-DD in local timezone
    const formattedDate = formatDateToLocalDate(eventDate);
    console.log("Formatted date for calendar entry:", formattedDate);
    
    return {
      title: parsedResponse.title || "Untitled Event",
      description: parsedResponse.description || "",
      date: formattedDate,
      entry_type: (parsedResponse.entry_type === 'work' || parsedResponse.entry_type === 'personal') 
                ? parsedResponse.entry_type 
                : 'personal',
      status: 'pending',
      is_recurring: !!parsedResponse.is_recurring,
      recurrence_pattern: parsedResponse.is_recurring ? (parsedResponse.recurrence_pattern || 'weekly') : undefined,
      has_reminder: !!parsedResponse.has_reminder,
      reminder_days_before: parsedResponse.has_reminder 
                          ? (parsedResponse.reminder_days_before || 1) 
                          : undefined,
    };
  } catch (error) {
    console.error("Error analyzing calendar text:", error);
    toast({
      title: "Error",
      description: "Could not analyze your calendar entry. Please try again or create manually.",
      variant: "destructive",
    });
    throw error;
  }
}; 