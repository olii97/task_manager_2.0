import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useChatAssistant } from './useChatAssistant';

const ChatBot: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const {
    input,
    setInput,
    messages,
    isLoading,
    assistantInfo,
    useAssistant,
    toggleChatMode,
    handleSendMessage,
    threadId
  } = useChatAssistant(userId);

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
