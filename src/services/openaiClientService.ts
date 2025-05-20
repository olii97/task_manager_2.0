// This is a placeholder service for OpenAI integration
// This allows the taskListener to compile while we work on implementing the actual OpenAI client

import { supabase } from '@/integrations/supabase/client'; // Assuming you use this for session

// Function to get the Supabase URL and Anon Key from environment variables
const getSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is not defined in environment variables.");
    throw new Error("Supabase configuration is missing.");
  }
  return { supabaseUrl, supabaseAnonKey };
};

interface OpenAIProxyParams {
  prompt: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export const callOpenAIProxy = async (params: OpenAIProxyParams): Promise<any> => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/openai-proxy`;

  try {
    // Get the current session for the JWT token
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("User is not authenticated. Cannot call OpenAI proxy.");
    }

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Supabase Edge Functions typically use the standard Authorization header for JWTs
        'Authorization': `Bearer ${session.access_token}`,
        // The anon key is often used for invoking functions, especially if RLS is involved
        // or if the function isn't fully protected by JWT yet.
        'apikey': supabaseAnonKey, 
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use text
        errorData = { error: await response.text() || `Request failed with status ${response.status}` };
      }
      console.error("OpenAI Proxy request failed:", errorData);
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling OpenAI proxy service:", error);
    // Re-throw the error so it can be caught by the caller
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred while calling the OpenAI proxy.");
  }
};

// Placeholder functions - can be removed or adapted if not needed elsewhere
export const isOpenAIClientAvailable = (): boolean => {
  // This will now depend on whether the proxy can be reached and user is auth'd
  // For simplicity, we can assume it's available if Supabase is configured.
  try {
    getSupabaseConfig();
    return true;
  } catch {
    return false;
  }
};

// getOpenAIClient and initializeOpenAIClient are no longer needed as the client is server-side.
// You can remove them or adapt them if you have other client-side logic that depended on them.
