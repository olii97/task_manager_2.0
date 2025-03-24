import { toast } from "@/components/ui/use-toast";

// Get the client-side API key from environment variables
const CLIENT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 
                      import.meta.env.VITE_OPENAI_CLIENT_KEY || 
                      import.meta.env.REACT_APP_OPENAI_CLIENT_KEY;

export interface NutritionItem {
  food_item: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface NutritionResult {
  items: NutritionItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export type OpenAIModel = "gpt-3.5-turbo" | "gpt-4-turbo-preview";

export const analyzeMeal = async (
  mealDescription: string,
  model: OpenAIModel = "gpt-4-turbo-preview"
): Promise<NutritionResult> => {
  if (!CLIENT_API_KEY) {
    throw new Error('API key is missing. Please check your environment variables.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLIENT_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are a nutrition analysis expert. Analyze the meal description and provide detailed nutrition information for each food item and total values.
            Format the response as a JSON object with the following structure:
            {
              "items": [
                {
                  "food_item": "string",
                  "calories": number,
                  "protein": number (in grams),
                  "carbs": number (in grams),
                  "fat": number (in grams),
                  "fiber": number (in grams)
                }
              ],
              "totals": {
                "calories": number,
                "protein": number (in grams),
                "carbs": number (in grams),
                "fat": number (in grams),
                "fiber": number (in grams)
              }
            }
            Be precise with the numbers and include all items mentioned in the meal.`
          },
          {
            role: "user",
            content: mealDescription
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze meal');
    }

    const data = await response.json();
    const nutritionData = JSON.parse(data.choices[0].message.content) as NutritionResult;
    
    // Log the response for debugging
    console.log("Nutrition analysis response:", JSON.stringify(nutritionData, null, 2));
    
    return nutritionData;
  } catch (error) {
    console.error('Error analyzing meal:', error);
    toast({
      title: "Error",
      description: "Failed to analyze meal. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
}; 