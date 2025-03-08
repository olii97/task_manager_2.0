
import { supabase } from '@/integrations/supabase/client';
import { Message, AssistantInfo } from '@/components/chat/types';
import { toast } from '@/components/ui/use-toast';

interface InitializeChatResponse {
  threadId?: string | null;
  assistantInfo: AssistantInfo | null;
  welcomeMessage: Message;
}

/**
 * Initializes a chat thread with OpenAI
 */
export const initializeChat = async (useAssistant: boolean): Promise<InitializeChatResponse> => {
  try {
    console.log('Initializing chat thread...');
    
    const { data, error } = await supabase.functions.invoke('openai-chat', {
      body: { useAssistant }
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
      
      return {
        threadId: data.threadId,
        assistantInfo: {
          model: data.model || 'gpt-4o-mini',
          assistantId: data.assistantId
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
  messages: Message[]
): Promise<Message | null> => {
  try {
    if (useAssistant) {
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
      
      console.log('Sending message to thread:', threadId);
      
      // Initial message submission
      const { data: initialData, error: initialError } = await supabase.functions.invoke('openai-chat', {
        body: {
          threadId,
          message: input,
          useAssistant: true
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
            checkStatus: true
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
          getMessages: true
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
