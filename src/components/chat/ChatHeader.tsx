import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ToggleLeft, ToggleRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AssistantInfo } from './types';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ChatHeaderProps {
  assistantInfo: AssistantInfo | null;
  useAssistant: boolean;
  toggleChatMode: () => void;
  threadId?: string | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  assistantInfo, 
  useAssistant, 
  toggleChatMode,
  threadId
}) => {
  return (
    <CardHeader className="pb-3 flex flex-row items-center justify-between bg-stone-100 border-b border-stone-200">
      <div className="flex items-center gap-2">
        <CardTitle className="text-lg text-stone-800">AI Assistant</CardTitle>
        {assistantInfo && assistantInfo.assistantId && (
          <Badge variant="outline" className="bg-stone-200 text-stone-700 border-stone-300 text-xs">
            {assistantInfo.model || "gpt-4o-mini"}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 text-xs bg-stone-200 text-stone-700 hover:bg-stone-300 hover:text-stone-800 border-stone-300" 
          onClick={toggleChatMode}
        >
          {useAssistant ? (
            <ToggleRight className="h-4 w-4 mr-1" />
          ) : (
            <ToggleLeft className="h-4 w-4 mr-1" />
          )}
          {useAssistant ? 'Assistant' : 'Chat'}
        </Button>
        
        {assistantInfo && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-xs text-stone-600 cursor-help bg-stone-200 px-2 py-1 rounded-md">
                  <Info className="h-3 w-3" />
                  <span>Info</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] bg-stone-100 border-stone-300">
                <p>Mode: <strong>{useAssistant ? 'Assistant' : 'Chat'}</strong></p>
                <p>Model: <strong>{assistantInfo.model || "Unknown"}</strong></p>
                {assistantInfo.assistantId && (
                  <p>Assistant ID: <strong className="text-amber-700">{assistantInfo.assistantId}</strong></p>
                )}
                {threadId && (
                  <p>Thread ID: <strong className="text-amber-700">{threadId}</strong></p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </CardHeader>
  );
};

export default ChatHeader;
