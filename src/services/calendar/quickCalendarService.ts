import { toast } from "@/hooks/use-toast";
import { NewCalendarEntry } from "./calendarService";

// Get the client-side API key from environment variables
const CLIENT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 
                      import.meta.env.VITE_OPENAI_CLIENT_KEY || 
                      import.meta.env.REACT_APP_OPENAI_CLIENT_KEY;

export const analyzeCalendarText = async (calendarText: string): Promise<NewCalendarEntry> => {
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
            content: `You are a calendar assistant. Analyze the user's calendar entry description and extract structured information.
            Format your response as JSON with the following fields:
            {
              "title": "Brief, clear entry title",
              "description": "Detailed description if available",
              "date": "YYYY-MM-DD" format (default to today if no date is specified),
              "entry_type": "work" or "personal" based on the nature of the event,
              "status": "pending" by default,
              "is_recurring": boolean based on if this is a recurring event,
              "recurrence_pattern": "daily", "weekly", "monthly", or "yearly" if is_recurring is true
            }
            
            For entry_type, classify as "work" if it's related to professional activities, meetings, deadlines, or work tasks.
            Classify as "personal" if it's related to personal activities, birthdays, family events, or personal habits.
            
            For date, extract the date from the text if provided. If only day of week is mentioned, calculate the correct date.
            If no date is mentioned, use today's date. Support relative dates like "tomorrow", "next Monday", etc.
            
            For is_recurring, look for indicators of repeating events like "every day", "weekly", "every month", etc.`
          },
          {
            role: "user",
            content: calendarText
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
    const calendarData = JSON.parse(data.choices[0].message.content);
    
    // Validate the required fields
    if (!calendarData.title) {
      throw new Error("Calendar analysis missing title");
    }
    
    if (!calendarData.date) {
      calendarData.date = new Date().toISOString().split('T')[0]; // Default to today
    }
    
    // Default values for missing fields
    if (calendarData.entry_type === undefined) {
      calendarData.entry_type = 'personal'; // Default to personal
    }
    
    if (!['work', 'personal'].includes(calendarData.entry_type)) {
      calendarData.entry_type = 'personal'; // Ensure valid entry type
    }
    
    if (calendarData.is_recurring === undefined) {
      calendarData.is_recurring = false;
    }
    
    // Recurrence pattern is only relevant if is_recurring is true
    if (calendarData.is_recurring && !calendarData.recurrence_pattern) {
      calendarData.recurrence_pattern = 'weekly'; // Default to weekly if not specified
    }
    
    // Return the validated calendar data
    return {
      title: calendarData.title,
      description: calendarData.description || "",
      date: calendarData.date,
      entry_type: calendarData.entry_type as 'work' | 'personal',
      status: 'pending',
      is_recurring: calendarData.is_recurring,
      recurrence_pattern: calendarData.recurrence_pattern,
    };
  } catch (error) {
    console.error("Error analyzing calendar text:", error);
    toast({
      title: "Error",
      description: "Failed to analyze calendar text. Please try again or create manually.",
      variant: "destructive",
    });
    throw error;
  }
}; 