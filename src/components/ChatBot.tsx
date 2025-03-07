
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { addTask } from "@/services/tasks";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string[];
}

const ChatBot: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Initialize thread on component mount
  useEffect(() => {
    const initializeThread = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("openai-chat", {
          body: { useAssistant: true },
        });

        if (error) throw error;
        setThreadId(data.threadId);
      } catch (error) {
        console.error("Error initializing chat thread:", error);
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

      // Handle function calls
      if (data.functionCall) {
        // Process function call
        const { name, arguments: args } = data.functionCall;
        
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
                runId: data.functionCall.runId,
                toolCallId: data.functionCall.toolCallId
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

  return (
    <Card className="shadow-md border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">AI Assistant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-60 px-1" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Ask me to add tasks to your backlog or today's schedule.
              </p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${
                    msg.role === 'user' ? 'ml-8 bg-muted/50' : 'mr-8 bg-primary/10'
                  } p-3 rounded-lg`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content[0]}</p>
                </div>
              ))
            )}
            {isLoading && (
              <div className="mr-8 bg-primary/10 p-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="min-h-10 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            className="px-3"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatBot;
