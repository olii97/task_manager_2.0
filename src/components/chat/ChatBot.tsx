
import React, { useRef, useState } from 'react';
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

  if (!isChatInitialized) {
    return (
      <Card className="shadow-lg border-stone-300 bg-white max-w-3xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <h3 className="text-xl font-semibold text-stone-800">Chat Assistant</h3>
          <p className="text-stone-600 text-center">
            Get help with your tasks, ask questions, or just chat with our AI assistant.
          </p>
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
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default ChatBot;
