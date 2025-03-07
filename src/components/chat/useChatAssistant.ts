
import { useState, useEffect, useCallback } from 'react';
import { Message, AssistantInfo } from './types';
import { initializeChat, sendChatMessage } from '@/services/chatService';

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
      
      const result = await initializeChat(useAssistant);
      
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
      
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      const assistantMessage = await sendChatMessage(input, threadId, useAssistant, messages);
      
      if (assistantMessage) {
        setMessages(prev => [...prev, assistantMessage]);
      }
      
    } catch (err) {
      console.error('Error in handleSendMessage:', err);
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
