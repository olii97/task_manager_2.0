
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
    handleSendMessage
  } = useChatAssistant(userId);

  return (
    <Card className="shadow-md border-primary/20">
      <ChatHeader assistantInfo={assistantInfo} />
      <CardContent className="space-y-4">
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
