import { useState, useEffect, useCallback } from 'react';
import { Message, AssistantInfo } from './types';
import { initializeChat, sendChatMessage } from '@/services/chatService';

export const useChatAssistant = (userId?: string, autoInitialize: boolean = true) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assistantInfo, setAssistantInfo] = useState<AssistantInfo | null>(null);
  const [useAssistant, setUseAssistant] = useState<boolean>(true);

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
  }, [input, threadId, isLoading, useAssistant, messages, assistantInfo, userId]);

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
    initializeChatThread
  };
};
