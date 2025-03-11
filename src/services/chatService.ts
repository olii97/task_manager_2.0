import { supabase } from '@/integrations/supabase/client';
import { Message, AssistantInfo } from '@/components/chat/types';
import { toast } from '@/components/ui/use-toast';
import { getActiveChatSession, createChatSession, updateChatSession } from './chatSessionService';
import { createTask } from '@/services/taskService';

const DEBUG_TOOL_CALLS = true; // Set to true to enable detailed tool call logging

interface InitializeChatResponse {
  threadId?: string | null;
  assistantInfo: AssistantInfo | null;
  welcomeMessage: Message;
}

interface RunStatus {
  status: string;
  last_error?: any;
}

interface FunctionCall {
  runId: string;
  toolCallId: string;
  name: string;
  arguments: any;
}

/**
 * Initializes a chat thread with OpenAI
 */
export const initializeChat = async (useAssistant: boolean, userId?: string): Promise<InitializeChatResponse> => {
  try {
    console.log('Initializing chat thread with useAssistant:', useAssistant);
    
    // Define a fixed assistant ID as fallback (must match the ID in the Supabase function)
    const FIXED_ASSISTANT_ID = "asst_DOAXZQD6pbB5wS27NxnOAOi9";
    
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
            reuseThread: true,
            assistantId: FIXED_ASSISTANT_ID
          }
        });

        if (error) {
          console.error('Error reusing chat thread:', error);
          // Fall back to regular initialization below
        } else if (data) {
          console.log('Successfully reused thread:', data);
          
          // Update the session with the correct assistant ID if it's different
          if (existingSession.assistant_id !== FIXED_ASSISTANT_ID) {
            console.log('Updating session with new assistant ID:', FIXED_ASSISTANT_ID);
            await updateChatSession(existingSession.id, {
              assistant_id: FIXED_ASSISTANT_ID,
              assistant_model: data.model || 'gpt-4o-mini'
            });
          }
          
          return {
            threadId: existingSession.thread_id,
            assistantInfo: {
              model: data.model || 'gpt-4o-mini',
              assistantId: FIXED_ASSISTANT_ID,
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
      body: { 
        useAssistant: useAssistant === true,
        assistantId: FIXED_ASSISTANT_ID
      }
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
        assistantId: FIXED_ASSISTANT_ID
      });
      
      // If we have a userId, store the chat session
      if (userId && data.threadId) {
        const assistantInfo = {
          model: data.model || 'gpt-4o-mini',
          assistantId: FIXED_ASSISTANT_ID,
          name: 'AI Assistant'
        };
        
        await createChatSession(userId, FIXED_ASSISTANT_ID, data.threadId, assistantInfo);
      }
      
      return {
        threadId: data.threadId,
        assistantInfo: {
          model: data.model || 'gpt-4o-mini',
          assistantId: FIXED_ASSISTANT_ID,
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
  assistantInfo?: AssistantInfo | null,
  userId?: string
): Promise<Message | null> => {
  try {
    // If we have a thread ID, always use assistant mode
    const shouldUseAssistant = threadId ? true : useAssistant;
    
    // Define a fixed assistant ID as fallback (must match the ID in the Supabase function)
    const FIXED_ASSISTANT_ID = "asst_DOAXZQD6pbB5wS27NxnOAOi9";
    
    console.log('Sending message with parameters:', {
      input: input.substring(0, 20) + (input.length > 20 ? '...' : ''),
      threadId,
      useAssistant: shouldUseAssistant,
      hasAssistantInfo: !!assistantInfo,
      assistantId: assistantInfo?.assistantId || FIXED_ASSISTANT_ID,
      userId: userId || 'NOT PROVIDED' // Log userId
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
      
      console.log('Sending message to thread:', threadId, 'with assistant:', assistantInfo?.assistantId || FIXED_ASSISTANT_ID);
      
      // Initial message submission
      const { data: initialData, error: initialError } = await supabase.functions.invoke('openai-chat', {
        body: {
          threadId,
          message: input,
          useAssistant: true, // Always set to true
          // Let the server use the fixed assistant ID
          reuseThread: true,
          // Include the fixed assistant ID explicitly
          assistantId: FIXED_ASSISTANT_ID
        }
      });

      // Log the complete response from the Supabase function
      console.log("%c========== COMPLETE RESPONSE FROM SUPABASE FUNCTION ==========", "background: #8a2be2; color: #fff; padding: 4px; border-radius: 4px;");
      console.log("Full initialData:", JSON.stringify(initialData, null, 2));
      console.log("Has runId:", !!initialData?.runId);
      console.log("Has functionCall:", !!initialData?.functionCall);
      if (initialData?.functionCall) {
        console.log("functionCall properties:", Object.keys(initialData.functionCall));
      }
      console.log("%c==========================================================", "background: #8a2be2; color: #fff; padding: 4px; border-radius: 4px;");

      if (initialError) throw initialError;
      if (!initialData?.runId) throw new Error('No run ID received');

      // Handle function call if received
      if (initialData.functionCall) {
        if (DEBUG_TOOL_CALLS) {
          console.log("%c========== FUNCTION CALL RECEIVED FROM SERVER ==========", "background: #f0ad4e; color: #000; padding: 4px; border-radius: 4px;");
          console.log("Thread ID:", threadId);
          console.log("Function call details:", JSON.stringify(initialData.functionCall, null, 2));
          console.log("Function call name:", initialData.functionCall.name);
          console.log("Function call arguments:", JSON.stringify(initialData.functionCall.arguments, null, 2));
          console.log("User ID available:", !!userId);
          console.log("User ID value:", userId || 'NOT PROVIDED');
        }
        
        console.log('Function call detected:', initialData.functionCall);
        const functionCall = initialData.functionCall as FunctionCall;
        
        // Execute the function and get the result
        let functionResult = null;
        if (functionCall.name === 'add_task' && userId) {
          if (DEBUG_TOOL_CALLS) {
            console.log("%c[TOOL CALL] Executing add_task function", "background: #5bc0de; color: #000; padding: 4px; border-radius: 4px;");
            console.log("User ID for task creation:", userId);
          }
          
          try {
            // Create the task in the database
            const taskData = {
              title: functionCall.arguments.title,
              description: functionCall.arguments.description || '',
              priority: functionCall.arguments.priority || 2,
              is_completed: false,
              is_scheduled_today: functionCall.arguments.is_scheduled_today || false,
              energy_level: functionCall.arguments.energy_level || 'high'
            };
            
            if (DEBUG_TOOL_CALLS) {
              console.log("Task data to be created:", taskData);
            }
            
            console.log('Creating task with data:', taskData);
            const result = await createTask(taskData, userId);
            functionResult = {
              success: true,
              message: `Task "${result.title}" has been created successfully.`,
              taskId: result.id
            };
            
            if (DEBUG_TOOL_CALLS) {
              console.log("%c[TOOL CALL] Task created successfully", "background: #5cb85c; color: #000; padding: 4px; border-radius: 4px;");
              console.log("Created task:", result);
            }
            
            toast({
              title: 'Task created',
              description: `"${result.title}" has been added to your task list.`
            });
            
            console.log('Task created successfully:', result);
          } catch (error) {
            if (DEBUG_TOOL_CALLS) {
              console.log("%c[TOOL CALL] Error creating task", "background: #d9534f; color: #fff; padding: 4px; border-radius: 4px;");
              console.error("Error details:", error);
            }
            
            console.error('Error creating task:', error);
            functionResult = {
              success: false,
              message: `Failed to create task: ${error.message}`
            };
            
            toast({
              title: 'Error creating task',
              description: 'There was a problem creating your task.',
              variant: 'destructive'
            });
          }
        } else {
          if (DEBUG_TOOL_CALLS) {
            console.log("%c[TOOL CALL] Unsupported function or missing userId", "background: #d9534f; color: #fff; padding: 4px; border-radius: 4px;");
          }
          
          console.log('Unsupported function or missing userId:', {
            functionName: functionCall.name,
            hasUserId: !!userId
          });
          functionResult = {
            success: false,
            message: userId ? 'Unsupported function call' : 'User ID required for this operation'
          };
        }
        
        // Submit function results back to the thread
        if (DEBUG_TOOL_CALLS) {
          console.log("%c[TOOL CALL] Submitting function results to server", "background: #5bc0de; color: #000; padding: 4px; border-radius: 4px;");
          console.log("Function results:", functionResult);
        }
        
        console.log('Submitting function results:', functionResult);
        const { data: functionData, error: functionError } = await supabase.functions.invoke('openai-chat', {
          body: {
            threadId,
            useAssistant: true,
            functionResults: {
              runId: functionCall.runId,
              toolCallId: functionCall.toolCallId,
              result: functionResult
            },
            assistantId: FIXED_ASSISTANT_ID
          }
        });
        
        if (DEBUG_TOOL_CALLS) {
          if (functionError) {
            console.log("%c[TOOL CALL] Error submitting function results", "background: #d9534f; color: #fff; padding: 4px; border-radius: 4px;");
            console.error("Error details:", functionError);
          } else {
            console.log("%c[TOOL CALL] Function results submitted successfully", "background: #5cb85c; color: #000; padding: 4px; border-radius: 4px;");
            console.log("Response:", functionData);
          }
          console.log("%c=================================================", "background: #f0ad4e; color: #000; padding: 4px; border-radius: 4px;");
        }
        
        if (functionError) throw functionError;
        // Get the run ID for the function result submission
        if (!functionData?.runId) throw new Error('No run ID received after function call');
        
        // Wait for the function run to complete
        let runStatus: RunStatus | null = null;
        while (!runStatus || ['queued', 'in_progress'].includes(runStatus.status)) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data, error } = await supabase.functions.invoke('openai-chat', {
            body: {
              threadId,
              runId: functionData.runId,
              checkStatus: true,
              useAssistant: true,
              assistantId: FIXED_ASSISTANT_ID
            }
          });
          
          if (error) throw error;
          runStatus = data as RunStatus;
        }
        
        // Get the response after function execution
        const { data: responseData, error: responseError } = await supabase.functions.invoke('openai-chat', {
          body: {
            threadId,
            runId: functionData.runId,
            getMessages: true,
            useAssistant: true,
            assistantId: FIXED_ASSISTANT_ID
          }
        });
        
        if (responseError || !responseData) {
          throw responseError || new Error('No response data after function execution');
        }
        
        if (responseData?.response) {
          return {
            id: Date.now().toString() + '-assistant',
            role: 'assistant',
            content: responseData.response,
            timestamp: new Date().toISOString(),
            ...(functionCall ? {
              functionCall: {
                name: functionCall.name,
                arguments: functionCall.arguments
              }
            } : {})
          };
        }
        
        // If we reach here without returning, fall back to polling for regular message
      }
      
      // Poll for completion
      let runStatus: RunStatus | null = null;
      while (!runStatus || ['queued', 'in_progress'].includes(runStatus.status)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            threadId,
            runId: initialData.runId,
            checkStatus: true,
            useAssistant: true, // Always set to true
            assistantId: FIXED_ASSISTANT_ID
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
          useAssistant: true, // Always set to true
          assistantId: FIXED_ASSISTANT_ID
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
        // Check if there was a function call in the initial data
        const hasFunctionCall = initialData.functionCall ? true : false;
        
        return {
          id: Date.now().toString() + '-assistant',
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          // Only include functionCall if there was one
          ...(hasFunctionCall && initialData.functionCall ? {
            functionCall: {
              name: initialData.functionCall.name,
              arguments: initialData.functionCall.arguments
            }
          } : {})
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
