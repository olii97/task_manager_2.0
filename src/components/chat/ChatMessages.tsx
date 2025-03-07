
import React, { useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from './types';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isLoading,
  scrollAreaRef 
}) => {
  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, scrollAreaRef]);

  return (
    <ScrollArea className="h-60 px-1" ref={scrollAreaRef}>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Ask me to add tasks to your backlog or today's schedule.
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`${
                msg.role === 'user' ? 'ml-8 bg-muted/50' : 'mr-8 bg-primary/10'
              } p-3 rounded-lg`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))
        )}
        {isLoading && (
          <div className="mr-8 bg-primary/10 p-3 rounded-lg">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
