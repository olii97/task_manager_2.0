
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, AssistantInfo } from './types';
import { toast } from '@/components/ui/use-toast';

export const useChatAssistant = (userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assistantInfo, setAssistantInfo] = useState<AssistantInfo | null>(null);

  // Initialize chat thread
  useEffect(() => {
    if (userId) {
      initializeChatThread();
    }
  }, [userId]);

  // Initialize the chat thread and get assistant info
  const initializeChatThread = async () => {
    try {
      setIsLoading(true);
      console.log('Initializing chat thread...');
      
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { useAssistant: true }
      });

      if (error) {
        console.error('Error initializing chat thread:', error);
        setAssistantInfo({
          model: 'Error connecting to OpenAI',
          assistantId: null
        });
        toast({
          title: 'Error initializing AI assistant',
          description: error.message || 'Please try again later',
          variant: 'destructive'
        });
        return;
      }

      if (data?.assistantId) {
        setAssistantInfo({
          model: data.model || 'gpt-4o-mini',
          assistantId: data.assistantId
        });
        
        console.log('Assistant info:', data);
        setThreadId(data.threadId);
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: 'welcome',
          role: 'assistant',
          content: "Hello! I'm your personal AI assistant. How can I help you today?",
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      } else {
        console.warn('No assistant ID returned:', data);
        setAssistantInfo({
          model: 'Unknown model',
          assistantId: 'Configuration error'
        });
      }
    } catch (err) {
      console.error('Unexpected error initializing chat:', err);
      toast({
        title: 'Error initializing AI assistant',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to assistant
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || !threadId || isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Add user message to the list
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      console.log('Sending message to thread:', threadId);
      
      // Send message to OpenAI
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          threadId,
          message: input,
          useAssistant: true
        }
      });
      
      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error sending message',
          description: error.message || 'Please try again later',
          variant: 'destructive'
        });
        return;
      }
      
      if (data?.response) {
        // Add assistant response to the list
        const assistantMessage: Message = {
          id: Date.now().toString() + '-assistant',
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.warn('No response from assistant:', data);
        toast({
          title: 'Error',
          description: 'No response received from the assistant.',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Unexpected error sending message:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while sending your message.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, threadId, isLoading]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    assistantInfo,
    handleSendMessage
  };
};
