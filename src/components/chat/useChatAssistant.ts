
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
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke("openai-chat", {
          body: { useAssistant: true },
        });

        if (error) throw error;
        setThreadId(data.threadId);
        if (data.assistantInfo) {
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

    initializeThread();
  }, []);

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
      const { data, error } = await supabase.functions.invoke("openai-chat", {
        body: {
          messages: [userMessage],
          threadId,
          useAssistant: true,
        },
      });

      if (error) throw error;

      // Update assistant info if available
      if (data.assistantInfo) {
        setAssistantInfo(data.assistantInfo);
      }

      // Handle function calls
      if (data.functionCall) {
        await handleFunctionCall(data.functionCall, userId);
      } else if (data.messages && data.messages.length > 0) {
        // Regular message (no function call)
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: [data.messages[0].content[0].text.value]
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

      if (resultError) throw resultError;
      
      // Add assistant response to the chat
      if (resultData.messages && resultData.messages.length > 0) {
        setMessages(prev => [
          ...prev, 
          {
            role: 'assistant',
            content: [resultData.messages[0].content[0].text.value]
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
