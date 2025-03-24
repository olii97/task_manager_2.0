import { supabase } from "@/supabaseClient";
import { NutritionResult } from "@/services/nutritionService";

export interface MealEntry {
  id?: string;
  user_id: string;
  meal_description: string;
  meal_date?: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
}

export interface NutritionItemEntry {
  id?: string;
  meal_entry_id: string;
  food_item: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export const saveMealEntry = async (
  userId: string,
  mealDescription: string,
  nutritionResult: NutritionResult
): Promise<MealEntry> => {
  console.log("Saving meal entry with nutrition result:", JSON.stringify(nutritionResult, null, 2));
  
  // First insert the meal entry
  const { data: mealEntry, error: mealError } = await supabase
    .from("meal_entries")
    .insert({
      user_id: userId,
      meal_description: mealDescription,
      meal_date: new Date().toISOString(),
      total_calories: nutritionResult.totals.calories,
      total_protein: nutritionResult.totals.protein,
      total_carbs: nutritionResult.totals.carbs,
      total_fat: nutritionResult.totals.fat,
      total_fiber: nutritionResult.totals.fiber
    })
    .select()
    .single();

  if (mealError) {
    console.error("Error saving meal entry:", mealError);
    throw new Error("Failed to save meal entry");
  }

  // Then insert all the nutrition items
  const nutritionItems = nutritionResult.items.map(item => ({
    meal_entry_id: mealEntry.id,
    food_item: item.food_item,
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    fiber: item.fiber
  }));

  const { error: itemsError } = await supabase
    .from("nutrition_items")
    .insert(nutritionItems);

  if (itemsError) {
    console.error("Error saving nutrition items:", itemsError);
    throw new Error("Failed to save nutrition items");
  }

  return mealEntry;
};

export const fetchMealEntries = async (userId: string): Promise<MealEntry[]> => {
  const { data, error } = await supabase
    .from("meal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("meal_date", { ascending: false });

  if (error) {
    console.error("Error fetching meal entries:", error);
    throw new Error("Failed to fetch meal entries");
  }

  return data || [];
};

export const fetchMealEntryWithItems = async (mealEntryId: string): Promise<{mealEntry: MealEntry, nutritionItems: NutritionItemEntry[]}> => {
  // Fetch meal entry
  const { data: mealEntry, error: mealError } = await supabase
    .from("meal_entries")
    .select("*")
    .eq("id", mealEntryId)
    .single();

  if (mealError) {
    console.error("Error fetching meal entry:", mealError);
    throw new Error("Failed to fetch meal entry");
  }

  // Fetch nutrition items for this meal
  const { data: nutritionItems, error: itemsError } = await supabase
    .from("nutrition_items")
    .select("*")
    .eq("meal_entry_id", mealEntryId);

  if (itemsError) {
    console.error("Error fetching nutrition items:", itemsError);
    throw new Error("Failed to fetch nutrition items");
  }

  return {
    mealEntry,
    nutritionItems: nutritionItems || []
  };
};

export const deleteMealEntry = async (mealEntryId: string): Promise<void> => {
  const { error } = await supabase
    .from("meal_entries")
    .delete()
    .eq("id", mealEntryId);

  if (error) {
    console.error("Error deleting meal entry:", error);
    throw new Error("Failed to delete meal entry");
  }
};

// Convert a database MealEntry to the NutritionResult format
export const mealEntryToNutritionResult = (
  mealEntry: MealEntry,
  nutritionItems: NutritionItemEntry[]
): NutritionResult => {
  return {
    items: nutritionItems.map(item => ({
      food_item: item.food_item,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      fiber: item.fiber
    })),
    totals: {
      calories: mealEntry.total_calories,
      protein: mealEntry.total_protein,
      carbs: mealEntry.total_carbs,
      fat: mealEntry.total_fat,
      fiber: mealEntry.total_fiber
    }
  };
}; 