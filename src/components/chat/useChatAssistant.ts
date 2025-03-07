
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage, AssistantInfo, FunctionCallResult } from './types';
import { addTask } from "@/services/tasks";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export const useChatAssistant = (userId: string | undefined) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assistantInfo, setAssistantInfo] = useState<AssistantInfo | null>(null);
  const queryClient = useQueryClient();

  // Initialize thread on component mount
  useEffect(() => {
    const initializeThread = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        console.log('Initializing chat thread');
        
        const { data, error } = await supabase.functions.invoke("openai-chat", {
          body: { useAssistant: true },
        });

        if (error) {
          console.error("Error initializing chat thread:", error);
          throw error;
        }

        console.log('Thread initialized:', data);
        
        setThreadId(data.threadId);
        if (data.assistantInfo) {
          console.log('Setting assistant info:', data.assistantInfo);
          setAssistantInfo(data.assistantInfo);
        }
      } catch (error) {
        console.error("Error initializing chat thread:", error);
        toast({
          title: "Error connecting to AI assistant",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      initializeThread();
    }
  }, [userId]);

  const handleSendMessage = async () => {
    if (!input.trim() || !threadId || !userId) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: [input],
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending message to thread:', threadId);
      
      const { data, error } = await supabase.functions.invoke("openai-chat", {
        body: {
          messages: [userMessage],
          threadId,
          useAssistant: true,
        },
      });

      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
      
      console.log('Received response:', data);

      // Update assistant info if available
      if (data.assistantInfo) {
        console.log('Updating assistant info:', data.assistantInfo);
        setAssistantInfo(data.assistantInfo);
      }

      // Handle function calls
      if (data.functionCall) {
        console.log('Function call detected:', data.functionCall);
        await handleFunctionCall(data.functionCall, userId);
      } else if (data.messages && data.messages.length > 0) {
        // Extract the message content correctly
        const firstMessage = data.messages[0];
        let messageContent = "";
        
        if (firstMessage.content && firstMessage.content.length > 0) {
          const contentItem = firstMessage.content[0];
          if (contentItem.type === 'text') {
            messageContent = contentItem.text.value;
          } else {
            messageContent = JSON.stringify(contentItem);
          }
        }
        
        console.log('Adding assistant message:', messageContent);
        
        // Regular message (no function call)
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: [messageContent]
          }
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: ['Sorry, I encountered an error. Please try again.']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFunctionCall = async (functionCall: FunctionCallResult, userId: string) => {
    const { name, arguments: args } = functionCall;
    
    if (name === 'add_task') {
      console.log('Adding task:', args);
      
      try {
        // Add the task to the database
        await addTask(userId, {
          title: args.title,
          description: args.description || "",
          priority: args.priority || 4,
          is_completed: false,
          is_scheduled_today: args.is_scheduled_today || false,
          energy_level: args.energy_level || undefined
        });

        // Invalidate tasks query to refresh task lists
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        
        // Show success toast
        toast({
          title: "Task added",
          description: `Added "${args.title}" to your ${args.is_scheduled_today ? "today's tasks" : "backlog"}`,
        });

        // Submit function results back to the thread
        console.log('Submitting function results back to thread');
        
        const { data: resultData, error: resultError } = await supabase.functions.invoke("openai-chat", {
          body: {
            threadId,
            useAssistant: true,
            functionResults: {
              runId: functionCall.runId,
              toolCallId: functionCall.toolCallId
            }
          },
        });

        if (resultError) {
          console.error("Error submitting function results:", resultError);
          throw resultError;
        }
        
        console.log('Function results submitted, received response:', resultData);
        
        // Add assistant response to the chat
        if (resultData.messages && resultData.messages.length > 0) {
          const firstMessage = resultData.messages[0];
          let messageContent = "";
          
          if (firstMessage.content && firstMessage.content.length > 0) {
            const contentItem = firstMessage.content[0];
            if (contentItem.type === 'text') {
              messageContent = contentItem.text.value;
            } else {
              messageContent = JSON.stringify(contentItem);
            }
          }
          
          console.log('Adding assistant response after function call:', messageContent);
          
          setMessages(prev => [
            ...prev, 
            {
              role: 'assistant',
              content: [messageContent]
            }
          ]);
        }
      } catch (error) {
        console.error("Error handling function call:", error);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: ['Sorry, there was an error adding your task. Please try again.']
          }
        ]);
      }
    }
  };

  return {
    input,
    setInput,
    messages,
    isLoading,
    assistantInfo,
    handleSendMessage
  };
};
