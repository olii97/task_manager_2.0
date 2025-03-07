
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
  const [useAssistant, setUseAssistant] = useState<boolean>(true);

  useEffect(() => {
    if (userId) {
      initializeChatThread();
    }
  }, [userId, useAssistant]);

  const toggleChatMode = useCallback(() => {
    setUseAssistant(prev => !prev);
    setMessages([]);
    setThreadId(null);
  }, []);

  const initializeChatThread = async () => {
    try {
      setIsLoading(true);
      console.log('Initializing chat thread...');
      
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { useAssistant }
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

      console.log('Response from openai-chat:', data);

      if (useAssistant) {
        if (data?.threadId) {
          setThreadId(data.threadId);
          setAssistantInfo({
            model: data.model || 'gpt-4o-mini',
            assistantId: data.assistantId
          });
          
          console.log('Assistant info:', {
            threadId: data.threadId,
            model: data.model || 'gpt-4o-mini',
            assistantId: data.assistantId
          });
          
          const welcomeMessage: Message = {
            id: 'welcome',
            role: 'assistant',
            content: "Hello! I'm your personal AI assistant. How can I help you today?",
            timestamp: new Date().toISOString()
          };
          setMessages([welcomeMessage]);
        } else {
          console.warn('No thread ID returned:', data);
          setAssistantInfo({
            model: 'Configuration error',
            assistantId: null
          });
          toast({
            title: 'Error initializing AI assistant',
            description: 'Invalid response from the server. Please try again later.',
            variant: 'destructive'
          });
        }
      } else {
        // Standard chat mode, no thread needed
        setAssistantInfo({
          model: 'gpt-4o-mini',
          assistantId: null
        });
        
        const welcomeMessage: Message = {
          id: 'welcome',
          role: 'assistant',
          content: "Hello! I'm using standard chat mode. How can I help you today?",
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
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

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    try {
      setIsLoading(true);
      
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      if (useAssistant) {
        // Assistant mode (requires thread ID)
        if (!threadId) {
          console.error('No thread ID available');
          toast({
            title: 'Error',
            description: 'Chat session not initialized properly.',
            variant: 'destructive'
          });
          return;
        }
        
        console.log('Sending message to thread:', threadId);
        
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
        
        console.log('Response data:', data);
        
        if (data?.response) {
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
          return;
        }
        
        console.log('Response data:', data);
        
        if (data?.messages && data.messages.length > 0) {
          const assistantMessage: Message = {
            id: Date.now().toString() + '-assistant',
            role: 'assistant',
            content: data.messages[0].content[0],
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, assistantMessage]);
        } else {
          console.warn('No response from chat:', data);
          toast({
            title: 'Error',
            description: 'No response received from the chat.',
            variant: 'destructive'
          });
        }
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
  }, [input, threadId, isLoading, useAssistant, messages]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    assistantInfo,
    useAssistant,
    toggleChatMode,
    handleSendMessage
  };
};
