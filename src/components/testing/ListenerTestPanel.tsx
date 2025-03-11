import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getOpenAIClient, isOpenAIClientAvailable } from '@/services/openaiClientService';
import { Badge } from "@/components/ui/badge";
import { Ear, EarOff } from "lucide-react";

interface ListenerTestPanelProps {
  userId: string | undefined;
  lastMessage: string | null;
  isListenerEnabled?: boolean;
}

interface TestMessage {
  role: 'user' | 'system' | 'listener';
  content: string;
  timestamp: string;
  json?: any;
}

const ListenerTestPanel: React.FC<ListenerTestPanelProps> = ({ 
  userId, 
  lastMessage,
  isListenerEnabled = true
}) => {
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClientAvailable, setIsClientAvailable] = useState(false);

  // Check if OpenAI client is available
  useEffect(() => {
    try {
      setIsClientAvailable(isOpenAIClientAvailable());
    } catch (error) {
      console.error('Error checking OpenAI client availability:', error);
      setIsClientAvailable(false);
      setMessages([{
        role: 'system',
        content: `Error initializing OpenAI client: ${error.message || 'Unknown error'}. Check your .env file and make sure VITE_OPENAI_CLIENT_KEY is set.`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  // Process new message through the task detection
  useEffect(() => {
    if (!lastMessage || !userId) return;
    
    if (!isClientAvailable) {
      setMessages(prev => [
        ...prev, 
        {
          role: 'system',
          content: 'OpenAI client not available. Add VITE_OPENAI_CLIENT_KEY to your .env file.',
          timestamp: new Date().toISOString()
        }
      ]);
      return;
    }

    // Skip processing if listeners are disabled
    if (!isListenerEnabled) {
      setMessages(prev => [
        ...prev, 
        {
          role: 'user',
          content: lastMessage,
          timestamp: new Date().toISOString()
        },
        {
          role: 'system',
          content: 'Listeners are currently disabled. Enable them to process messages.',
          timestamp: new Date().toISOString()
        }
      ]);
      return;
    }

    const processMessage = async () => {
      try {
        setIsProcessing(true);
        
        // Add user message to the test panel
        const userMessage: TestMessage = {
          role: 'user',
          content: lastMessage,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Use OpenAI directly (this mimics what the listener would do)
        const openai = getOpenAIClient();
        if (!openai) {
          setMessages(prev => [
            ...prev, 
            {
              role: 'system',
              content: 'OpenAI client not available. Add VITE_OPENAI_CLIENT_KEY to your .env file.',
              timestamp: new Date().toISOString()
            }
          ]);
          return;
        }
        
        // Make the API call directly (similar to what the task listener does)
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { 
              role: "system", 
              content: `You are a task detection specialist. Analyze if the message contains a task to be created.
                If yes, extract task details and respond with JSON:
                {
                  "shouldCreateTask": true,
                  "taskDetails": {
                    "title": "Task title",
                    "description": "Task description if available",
                    "priority": 1-4 (1 is highest),
                    "is_scheduled_today": true/false,
                    "energy_level": "high" or "low"
                  }
                }
                If no task is detected, respond with: {"shouldCreateTask": false}
                Be conservative - only detect clear task intentions.`
            },
            { role: "user", content: lastMessage }
          ],
          response_format: { type: "json_object" }
        });
        
        // Parse the response
        const result = JSON.parse(completion.choices[0].message.content);
        
        // Add listener response
        const listenerMessage: TestMessage = {
          role: 'listener',
          content: result.shouldCreateTask 
            ? `Task detected: "${result.taskDetails.title}"` 
            : "No task detected in message",
          timestamp: new Date().toISOString(),
          json: result
        };
        
        setMessages(prev => [...prev, listenerMessage]);
        
        // If a task would be created, show what would happen
        if (result.shouldCreateTask) {
          setMessages(prev => [
            ...prev, 
            {
              role: 'system',
              content: `Task would be created for user ${userId}: "${result.taskDetails.title}"`,
              timestamp: new Date().toISOString()
            }
          ]);
        }
        
      } catch (error) {
        console.error('Error in test panel:', error);
        setMessages(prev => [
          ...prev, 
          {
            role: 'system',
            content: `Error: ${error.message || 'Unknown error'}`,
            timestamp: new Date().toISOString()
          }
        ]);
      } finally {
        setIsProcessing(false);
      }
    };

    processMessage();
  }, [lastMessage, userId, isClientAvailable, isListenerEnabled]);

  return (
    <Card className="shadow-lg border-stone-300 bg-white h-full">
      <CardHeader className="bg-stone-100 border-b border-stone-200 py-2">
        <CardTitle className="text-sm flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Task Listener Test Panel</span>
            {isListenerEnabled ? (
              <Ear className="h-4 w-4 text-green-600" />
            ) : (
              <EarOff className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant={isListenerEnabled ? "default" : "secondary"} className={`text-xs ${isListenerEnabled ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}`}>
              {isListenerEnabled ? "Enabled" : "Disabled"}
            </Badge>
            <Badge variant={isClientAvailable ? "default" : "destructive"} className="text-xs">
              {isClientAvailable ? "API Ready" : "API Not Available"}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 bg-stone-50 h-[450px] flex flex-col">
        <ScrollArea className="h-full px-1 flex-1">
          <div className="space-y-4 p-3">
            {messages.length === 0 ? (
              <p className="text-center text-stone-500 bg-stone-100 p-4 rounded-lg border border-stone-200">
                {!isListenerEnabled ? (
                  "Listeners are currently disabled. Enable them to process messages."
                ) : isClientAvailable ? (
                  "This panel shows raw task listener input/output."
                ) : (
                  "OpenAI client not available. Add VITE_OPENAI_CLIENT_KEY to your .env file."
                )}
              </p>
            ) : (
              messages.map((msg, index) => {
                let msgStyles = '';
                let labelText = '';
                
                if (msg.role === 'user') {
                  msgStyles = 'ml-4 bg-stone-200 border border-stone-300 text-stone-800';
                  labelText = 'User Message';
                } else if (msg.role === 'listener') {
                  msgStyles = 'mr-4 bg-green-50 border border-green-200 text-green-800';
                  labelText = 'Listener Response';
                } else {
                  msgStyles = 'mx-4 bg-blue-50 border border-blue-200 text-blue-800';
                  labelText = 'System';
                }
                
                return (
                  <div
                    key={index}
                    className={`${msgStyles} p-3 rounded-lg shadow-sm text-xs`}
                  >
                    <div className="font-medium mb-1">{labelText}</div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.json && (
                      <div className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                        <pre className="text-xs">{JSON.stringify(msg.json, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {isProcessing && (
              <div className="mr-4 bg-green-50 border border-green-200 p-3 rounded-lg shadow-sm">
                <div className="text-xs font-medium mb-1">Listener</div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ListenerTestPanel; 