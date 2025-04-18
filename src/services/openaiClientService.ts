// This is a placeholder service for OpenAI integration
// This allows the taskListener to compile while we work on implementing the actual OpenAI client

import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export const isOpenAIClientAvailable = (): boolean => {
  return openaiClient !== null;
};

export const getOpenAIClient = async (): Promise<OpenAI | null> => {
  if (!openaiClient) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || 
                  import.meta.env.VITE_OPENAI_CLIENT_KEY || 
                  import.meta.env.REACT_APP_OPENAI_CLIENT_KEY;
    
    if (apiKey) {
      try {
        openaiClient = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true // Required for client-side usage
        });
      } catch (error) {
        console.error('Failed to initialize OpenAI client:', error);
        return null;
      }
    } else {
      console.warn('No OpenAI API key found in environment variables');
      return null;
    }
  }
  
  return openaiClient;
};

export const initializeOpenAIClient = (apiKey: string): void => {
  if (apiKey) {
    try {
      openaiClient = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
      openaiClient = null;
    }
  } else {
    openaiClient = null;
  }
};
