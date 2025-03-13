import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  input, 
  setInput, 
  handleSendMessage,
  isLoading 
}) => {
  const onSendMessage = () => {
    if (!isLoading && input.trim()) {
      handleSendMessage();
    }
  };

  return (
    <div className="flex space-x-2 bg-stone-100 p-3 rounded-lg border border-stone-200">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        className="min-h-10 resize-none bg-white border-stone-300 focus-visible:ring-amber-500"
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
          }
        }}
      />
      <Button
        className="px-3 bg-amber-600 hover:bg-amber-700 text-white"
        onClick={onSendMessage}
        disabled={isLoading || !input.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ChatInput;
