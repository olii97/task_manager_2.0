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
    <ScrollArea className="h-[400px] px-1 bg-gray-50 rounded-lg" ref={scrollAreaRef}>
      <div className="space-y-4 p-3">
        {messages.length === 0 ? (
          <p className="text-center text-stone-500 bg-stone-100 p-4 rounded-lg border border-stone-200">
            Ask me to add tasks to your backlog or today's schedule.
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`${
                msg.role === 'user' 
                  ? 'ml-8 bg-stone-200 border border-stone-300 text-stone-800' 
                  : 'mr-8 bg-amber-50 border border-amber-200 text-stone-800'
              } p-3 rounded-lg shadow-sm`}
            >
              <div className="text-xs font-medium mb-1 text-stone-500">
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))
        )}
        {isLoading && (
          <div className="mr-8 bg-amber-50 border border-amber-200 p-3 rounded-lg shadow-sm">
            <div className="text-xs font-medium mb-1 text-stone-500">
              Assistant
            </div>
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
