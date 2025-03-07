import { supabase } from "@/integrations/supabase/client";
import { StravaConnectionResult, StravaAuthUrlResult, StravaActionResult } from "./types";
import { toast } from "sonner";

/**
 * Checks if the user is connected to Strava
 */
export const isConnectedToStrava = async (userId: string): Promise<boolean> => {
  try {
    const { data: tokens, error } = await supabase
      .from("strava_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // Not the "no rows returned" error
        console.error("Error checking Strava connection:", error);
        toast.error("Error checking Strava connection");
      }
      return false;
    }

    return !!tokens;
  } catch (error) {
    console.error("Error checking Strava connection:", error);
    return false;
  }
};

/**
 * Checks the user's Strava connection status
 */
export const checkStravaConnection = async (userId: string): Promise<StravaConnectionResult> => {
  try {
    const isConnected = await isConnectedToStrava(userId);
    return { isConnected, error: null };
  } catch (error: any) {
    console.error("Error checking Strava connection:", error);
    return { 
      isConnected: false, 
      error: error.message || "Failed to check Strava connection" 
    };
  }
};

/**
 * Connects the user to Strava
 */
export const connectToStrava = async (sessionToken: string): Promise<StravaAuthUrlResult> => {
  try {
    const response = await supabase.functions.invoke<{ url: string }>(
      "strava-auth",
      {
        body: { action: "get_auth_url" },
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );

    if (response.error) {
      console.error("Strava auth URL error:", response.error);
      throw response.error;
    }

    if (!response.data?.url) {
      throw new Error("No authorization URL received");
    }

    return { url: response.data.url, error: null };
  } catch (error: any) {
    console.error("Error connecting to Strava:", error);
    return { url: null, error: error.message || "Failed to connect to Strava" };
  }
};

/**
 * Disconnects the user from Strava
 */
export const disconnectFromStrava = async (userId: string): Promise<StravaActionResult> => {
  try {
    const { error } = await supabase
      .from("strava_tokens")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error disconnecting Strava:", error);
      throw error;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error disconnecting from Strava:", error);
    return { success: false, error: error.message || "Failed to disconnect from Strava" };
  }
};

export const getStravaToken = async (userId: string) => {
  const { data, error } = await supabase
    .from('strava_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching Strava token:', error);
    throw error;
  }
  
  return data;
};

export const refreshTokenIfNeeded = async (userId: string, token: any) => {
  // Mock implementation - the original function likely checks token expiry
  // and refreshes if needed
  return token;
};
