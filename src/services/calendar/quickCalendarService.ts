import { toast } from "@/hooks/use-toast";
import { NewCalendarEntry } from "./calendarService";
import { format, addDays, nextMonday } from "date-fns";

// Get the client-side API key - we'll try both formats
const CLIENT_KEY = import.meta.env.VITE_OPENAI_CLIENT_KEY || 
                  import.meta.env.VITE_OPENAI_API_KEY ||
                  import.meta.env.REACT_APP_OPENAI_CLIENT_KEY;

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
    // Get today's date for the system prompt
    const today = new Date();
    const todayFormatted = format(today, "yyyy-MM-dd");
    const todayReadable = format(today, "EEEE, MMMM d, yyyy");
    
    // Most basic and direct approach
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
            
            When user mentions days like "tomorrow", "next Monday", or "in 2 weeks", calculate the correct date based on today.
            When only time is mentioned (e.g., "at 3pm"), use today's date.
            
            Examples (assuming today is ${todayReadable}):
            Input: "Doctor appointment tomorrow at 2pm"
            Output: {
              "title": "Doctor appointment",
              "description": "At 2pm",
              "date": "${format(new Date(today.getTime() + 86400000), 'yyyy-MM-dd')}",
              "entry_type": "personal",
              "is_recurring": false
            }
            
            Input: "Weekly team meeting every Monday at 10am"
            Output: {
              "title": "Weekly team meeting",
              "description": "At 10am",
              "date": "${format(nextMonday(today), 'yyyy-MM-dd')}",
              "entry_type": "work",
              "is_recurring": true,
              "recurrence_pattern": "weekly"
            }
            
            Input: "Buy groceries this evening"
            Output: {
              "title": "Buy groceries",
              "description": "This evening",
              "date": "${todayFormatted}",
              "entry_type": "personal",
              "is_recurring": false
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
    
    // Set defaults for missing fields
    const todayIsoDate = todayFormatted;
    
    // Return the validated calendar data
    return {
      title: parsedResponse.title || "Untitled Event",
      description: parsedResponse.description || "",
      date: parsedResponse.date || todayIsoDate,
      entry_type: (parsedResponse.entry_type === 'work' || parsedResponse.entry_type === 'personal') 
                ? parsedResponse.entry_type 
                : 'personal',
      status: 'pending',
      is_recurring: !!parsedResponse.is_recurring,
      recurrence_pattern: parsedResponse.is_recurring ? (parsedResponse.recurrence_pattern || 'weekly') : undefined,
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