import { useState, useEffect, useCallback } from 'react';
import { Message, AssistantInfo } from './types';
import { initializeChat, sendChatMessage } from '@/services/chatService';
import { useListenerManager } from '@/hooks/useListenerManager';
import { toast } from '@/components/ui/use-toast';

export const useChatAssistant = (userId?: string, autoInitialize: boolean = true) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assistantInfo, setAssistantInfo] = useState<AssistantInfo | null>(null);
  const [useAssistant, setUseAssistant] = useState<boolean>(true);
  
  // Initialize the listener manager
  const { 
    processMessage, 
    isInitialized: isListenerInitialized,
    isEnabled: isListenerEnabled,
    toggleListeners
  } = useListenerManager(userId || null);

  useEffect(() => {
    if (userId && autoInitialize) {
      initializeChatThread();
    }
  }, [userId, useAssistant, autoInitialize]);

  const toggleChatMode = useCallback(() => {
    setUseAssistant(prev => !prev);
    setMessages([]);
    setThreadId(null);
  }, []);

  const initializeChatThread = async () => {
    try {
      setIsLoading(true);
      
      const result = await initializeChat(useAssistant, userId);
      
      setThreadId(result.threadId || null);
      setAssistantInfo(result.assistantInfo);
      setMessages([result.welcomeMessage]);
      
    } catch (err) {
      console.error('Error in initializeChatThread:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Debug log for userId
      console.log('useChatAssistant - handleSendMessage - userId:', userId);
      
      // Store the current userId in a local variable to ensure it's captured in the closure
      const currentUserId = userId;
      console.log('useChatAssistant - handleSendMessage - currentUserId:', currentUserId);
      
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      // Process the message with the listener system first
      if (isListenerInitialized && isListenerEnabled) {
        console.log('Processing message with listener system');
        const listenerResults = await processMessage(input);
        
        // Handle any detected actions
        for (const result of listenerResults) {
          console.log('Listener result:', result);
          
          if (result.actionType === 'task_created') {
            // Show a toast notification
            toast({
              title: 'Task Created',
              description: result.data.message,
              variant: 'default'
            });
            
            // Add a system message about the task creation
            const systemMessage: Message = {
              id: Date.now().toString() + '-system',
              role: 'system',
              content: result.data.message,
              timestamp: new Date().toISOString()
            };
            
            setMessages(prev => [...prev, systemMessage]);
          }
        }
      } else if (!isListenerEnabled) {
        console.log('Listeners are disabled. Skipping listener processing.');
      }
      
      // Still send the message to the main assistant for a conversational response
      const assistantMessage = await sendChatMessage(
        input, 
        threadId, 
        useAssistant, 
        messages, 
        assistantInfo,
        currentUserId // Use the local variable to ensure it's not lost
      );
      
      if (assistantMessage) {
        setMessages(prev => [...prev, assistantMessage]);
      }
      
    } catch (err) {
      console.error('Error in handleSendMessage:', err);
    } finally {
      setIsLoading(false);
    }
  }, [input, threadId, isLoading, useAssistant, messages, assistantInfo, userId, processMessage, isListenerInitialized, isListenerEnabled]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    assistantInfo,
    useAssistant,
    toggleChatMode,
    handleSendMessage,
    threadId,
    initializeChatThread,
    // Expose listener controls
    isListenerEnabled,
    toggleListeners
  };
};
