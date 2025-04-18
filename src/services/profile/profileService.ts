import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Creates a new profile for a user if it doesn't exist
 */
export const createProfileIfNotExists = async (userId: string): Promise<void> => {
  try {
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") { // PGRST116 is "no rows returned"
      console.error("Error checking profile:", checkError);
      throw checkError;
    }

    // If profile doesn't exist, create it
    if (!existingProfile) {
      const { error: createError } = await supabase
        .from("profiles")
        .insert([
          {
            id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (createError) {
        console.error("Error creating profile:", createError);
        throw createError;
      }

      toast.success("Profile created successfully");
    }
  } catch (error) {
    console.error("Error in createProfileIfNotExists:", error);
    toast.error("Failed to create profile");
    throw error;
  }
};

/**
 * Updates a user's profile
 */
export const updateProfile = async (
  userId: string,
  updates: {
    updated_at?: string;
  }
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    toast.success("Profile updated successfully");
  } catch (error) {
    console.error("Error in updateProfile:", error);
    toast.error("Failed to update profile");
    throw error;
  }
}; 