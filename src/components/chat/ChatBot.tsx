import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useChatAssistant } from './useChatAssistant';
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const ChatBot: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isChatInitialized, setIsChatInitialized] = useState(false);
  
  // Debug log for userId
  useEffect(() => {
    console.log('ChatBot - userId from session:', userId);
  }, [userId]);
  
  const {
    input,
    setInput,
    messages,
    isLoading,
    assistantInfo,
    useAssistant,
    toggleChatMode,
    handleSendMessage,
    threadId,
    initializeChatThread
  } = useChatAssistant(userId, false); // Pass false to prevent auto-initialization

  const handleStartChat = async () => {
    await initializeChatThread();
    setIsChatInitialized(true);
  };

  // Create a wrapper for handleSendMessage to ensure userId is passed
  const handleSendWithUserId = async () => {
    console.log('ChatBot - handleSendWithUserId - userId:', userId);
    await handleSendMessage();
  };

  if (!isChatInitialized) {
    return (
      <Card className="shadow-lg border-stone-300 bg-white max-w-3xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <h3 className="text-xl font-semibold text-stone-800">Chat Assistant</h3>
          <p className="text-stone-600 text-center">
            Get help with your tasks, ask questions, or just chat with our AI assistant.
          </p>
          <div className="bg-blue-50 p-4 rounded-md w-full">
            <h4 className="font-medium text-blue-800 mb-2">New Feature: Task Creation</h4>
            <p className="text-sm text-blue-700">
              You can now ask the assistant to create tasks for your backlog! Try phrases like:
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside mt-2 space-y-1">
              <li>Add a new task to update my resume</li>
              <li>Create a high priority task to finish the project proposal</li>
              <li>Add "Call John" to my task list for today</li>
            </ul>
          </div>
          <Button 
            onClick={handleStartChat} 
            className="mt-4 bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {isLoading ? "Initializing..." : "Start Chatting"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-stone-300 bg-white max-w-3xl mx-auto">
      <ChatHeader 
        assistantInfo={assistantInfo} 
        useAssistant={useAssistant}
        toggleChatMode={toggleChatMode}
        threadId={threadId}
      />
      <CardContent className="space-y-4 p-4 bg-stone-50">
        <ChatMessages 
          messages={messages} 
          isLoading={isLoading} 
          scrollAreaRef={scrollAreaRef}
        />
        <ChatInput 
          input={input} 
          setInput={setInput} 
          handleSendMessage={handleSendWithUserId}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default ChatBot;
