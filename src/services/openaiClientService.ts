import OpenAI from 'openai';

// Create a singleton OpenAI client
let openaiClient: OpenAI | null = null;

/**
 * Initialize the OpenAI client with an API key
 * For client-side usage, use with caution and consider security implications
 * In production, consider using a proxy or server-side approach
 */
export function initializeOpenAIClient() {
  // Get API key from environment variable - only for development
  // Use import.meta.env for Vite instead of process.env
  const apiKey = import.meta.env.VITE_OPENAI_CLIENT_KEY || import.meta.env.REACT_APP_OPENAI_CLIENT_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI client API key not found. Client-side listeners will not function.');
    console.warn('Make sure to add VITE_OPENAI_CLIENT_KEY to your .env file');
    return null;
  }

  // Create the OpenAI client
  openaiClient = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Required for client-side usage
  });

  return openaiClient;
}

/**
 * Get the OpenAI client, initializing it if necessary
 */
export function getOpenAIClient(): OpenAI | null {
  if (!openaiClient) {
    return initializeOpenAIClient();
  }
  return openaiClient;
}

/**
 * Check if client-side OpenAI is available
 */
export function isOpenAIClientAvailable(): boolean {
  return !!getOpenAIClient();
} 