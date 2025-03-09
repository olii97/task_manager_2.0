import { supabase } from '@/integrations/supabase/client';
import { Message, AssistantInfo } from '@/components/chat/types';
import { toast } from '@/components/ui/use-toast';
import { getActiveChatSession, createChatSession, updateChatSession } from './chatSessionService';

interface InitializeChatResponse {
  threadId?: string | null;
  assistantInfo: AssistantInfo | null;
  welcomeMessage: Message;
}

interface RunStatus {
  status: string;
  last_error?: any;
}

/**
 * Initializes a chat thread with OpenAI
 */
export const initializeChat = async (useAssistant: boolean, userId?: string): Promise<InitializeChatResponse> => {
  try {
    console.log('Initializing chat thread with useAssistant:', useAssistant);
    
    // If we have a userId, check for an existing chat session
    if (userId && useAssistant) {
      const existingSession = await getActiveChatSession(userId);
      
      if (existingSession) {
        console.log('Found existing chat session:', existingSession);
        
        // Call the Supabase function with the existing thread ID and reuseThread flag
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: { 
            useAssistant: true,
            threadId: existingSession.thread_id,
            // Always use the fixed assistant ID defined in the Supabase function
            // instead of the one stored in the database
            reuseThread: true
          }
        });

        if (error) {
          console.error('Error reusing chat thread:', error);
          // Fall back to regular initialization below
        } else if (data) {
          console.log('Successfully reused thread:', data);
          
          // Update the session with the correct assistant ID if it's different
          if (existingSession.assistant_id !== data.assistantId) {
            console.log('Updating session with new assistant ID:', data.assistantId);
            await updateChatSession(existingSession.id, {
              assistant_id: data.assistantId,
              assistant_model: data.model || 'gpt-4o-mini'
            });
          }
          
          return {
            threadId: existingSession.thread_id,
            assistantInfo: {
              model: data.model || 'gpt-4o-mini',
              assistantId: data.assistantId,
              name: existingSession.assistant_name
            },
            welcomeMessage: {
              id: 'welcome',
              role: 'assistant',
              content: "Welcome back! I'm here to continue our conversation. How can I help you today?",
              timestamp: new Date().toISOString()
            }
          };
        }
      }
    }
    
    const { data, error } = await supabase.functions.invoke('openai-chat', {
      body: { useAssistant: useAssistant === true }
    });

    if (error) {
      console.error('Error initializing chat thread:', error);
      toast({
        title: 'Error initializing AI assistant',
        description: error.message || 'Please try again later',
        variant: 'destructive'
      });
      
      return {
        threadId: null,
        assistantInfo: {
          model: 'Error connecting to OpenAI',
          assistantId: null
        },
        welcomeMessage: {
          id: 'welcome',
          role: 'assistant',
          content: "Sorry, I couldn't connect to the AI service. Please try again later.",
          timestamp: new Date().toISOString()
        }
      };
    }

    console.log('Response from openai-chat:', data);

    if (useAssistant) {
      if (!data?.threadId) {
        console.warn('No thread ID returned:', data);
        toast({
          title: 'Error initializing AI assistant',
          description: 'Invalid response from the server. Please try again later.',
          variant: 'destructive'
        });
        
        return {
          threadId: null,
          assistantInfo: {
            model: 'Configuration error',
            assistantId: null
          },
          welcomeMessage: {
            id: 'welcome',
            role: 'assistant',
            content: "Sorry, there was a configuration error with the AI assistant. Please try again later.",
            timestamp: new Date().toISOString()
          }
        };
      }
      
      console.log('Assistant info:', {
        threadId: data.threadId,
        model: data.model || 'gpt-4o-mini',
        assistantId: data.assistantId
      });
      
      // If we have a userId, store the chat session
      if (userId && data.threadId && data.assistantId) {
        const assistantInfo = {
          model: data.model || 'gpt-4o-mini',
          assistantId: data.assistantId,
          name: 'AI Assistant'
        };
        
        await createChatSession(userId, data.assistantId, data.threadId, assistantInfo);
      }
      
      return {
        threadId: data.threadId,
        assistantInfo: {
          model: data.model || 'gpt-4o-mini',
          assistantId: data.assistantId,
          name: 'AI Assistant'
        },
        welcomeMessage: {
          id: 'welcome',
          role: 'assistant',
          content: "Hello! I'm your personal AI assistant. How can I help you today?",
          timestamp: new Date().toISOString()
        }
      };
    } else {
      // Standard chat mode, no thread needed
      return {
        threadId: null,
        assistantInfo: {
          model: 'gpt-4o-mini',
          assistantId: null
        },
        welcomeMessage: {
          id: 'welcome',
          role: 'assistant',
          content: "Hello! I'm using standard chat mode. How can I help you today?",
          timestamp: new Date().toISOString()
        }
      };
    }
  } catch (err) {
    console.error('Unexpected error initializing chat:', err);
    toast({
      title: 'Error initializing AI assistant',
      description: 'An unexpected error occurred. Please try again later.',
      variant: 'destructive'
    });
    
    return {
      threadId: null,
      assistantInfo: {
        model: 'Error',
        assistantId: null
      },
      welcomeMessage: {
        id: 'welcome',
        role: 'assistant',
        content: "Sorry, I couldn't connect to the AI service. Please try again later.",
        timestamp: new Date().toISOString()
      }
    };
  }
};

/**
 * Sends a user message to the chat backend and returns the response
 */
export const sendChatMessage = async (
  input: string, 
  threadId: string | null, 
  useAssistant: boolean, 
  messages: Message[],
  assistantInfo?: AssistantInfo | null
): Promise<Message | null> => {
  try {
    // If we have a thread ID, always use assistant mode
    const shouldUseAssistant = threadId ? true : useAssistant;
    
    console.log('Sending message with parameters:', {
      input: input.substring(0, 20) + (input.length > 20 ? '...' : ''),
      threadId,
      useAssistant: shouldUseAssistant,
      hasAssistantInfo: !!assistantInfo,
      assistantId: assistantInfo?.assistantId
    });
    
    if (shouldUseAssistant) {
      // Assistant mode (requires thread ID)
      if (!threadId) {
        console.error('No thread ID available');
        toast({
          title: 'Error',
          description: 'Chat session not initialized properly.',
          variant: 'destructive'
        });
        return null;
      }
      
      console.log('Sending message to thread:', threadId, 'with assistant:', assistantInfo?.assistantId);
      
      // Initial message submission
      const { data: initialData, error: initialError } = await supabase.functions.invoke('openai-chat', {
        body: {
          threadId,
          message: input,
          useAssistant: true, // Always set to true
          // Let the server use the fixed assistant ID
          reuseThread: true
        }
      });

      if (initialError) throw initialError;
      if (!initialData?.runId) throw new Error('No run ID received');

      // Poll for completion
      let runStatus: RunStatus | null = null;
      while (!runStatus || ['queued', 'in_progress'].includes(runStatus.status)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            threadId,
            runId: initialData.runId,
            checkStatus: true,
            useAssistant: true // Always set to true
          }
        });
        
        if (error) throw error;
        runStatus = data as RunStatus;
      }

      if (runStatus.status === 'failed') {
        throw new Error('Assistant run failed');
      }

      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          threadId,
          runId: initialData.runId,
          getMessages: true,
          useAssistant: true // Always set to true
        }
      });
      
      if (error || !data) {
        console.error('Error retrieving assistant response:', error);
        toast({
          title: 'Error retrieving response',
          description: error?.message || 'Assistant response retrieval failed',
          variant: 'destructive'
        });
        return null;
      }
      
      console.log('Response data:', data);
      
      if (data?.response) {
        return {
          id: Date.now().toString() + '-assistant',
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        };
      } else {
        console.warn('No response from assistant:', data);
        toast({
          title: 'Error',
          description: 'No response received from the assistant.',
          variant: 'destructive'
        });
        return null;
      }
    } else {
      // Standard chat mode
      console.log('Using standard chat completion');
      
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: [msg.content]
      }));
      formattedMessages.push({
        role: 'user',
        content: [input]
      });
      
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          messages: formattedMessages,
          useAssistant: false
        }
      });
      
      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error sending message',
          description: error.message || 'Please try again later',
          variant: 'destructive'
        });
        return null;
      }
      
      console.log('Response data:', data);
      
      if (data?.messages && data.messages.length > 0) {
        return {
          id: Date.now().toString() + '-assistant',
          role: 'assistant',
          content: data.messages[0].content[0],
          timestamp: new Date().toISOString()
        };
      } else {
        console.warn('No response from chat:', data);
        toast({
          title: 'Error',
          description: 'No response received from the chat.',
          variant: 'destructive'
        });
        return null;
      }
    }
  } catch (err) {
    console.error('Unexpected error sending message:', err);
    toast({
      title: 'Error',
      description: 'An unexpected error occurred while sending your message.',
      variant: 'destructive'
    });
    return null;
  }
};
