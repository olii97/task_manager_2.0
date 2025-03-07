
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ToggleLeft, ToggleRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AssistantInfo } from './types';
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  assistantInfo: AssistantInfo | null;
  useAssistant: boolean;
  toggleChatMode: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  assistantInfo, 
  useAssistant, 
  toggleChatMode 
}) => {
  return (
    <CardHeader className="pb-3 flex flex-row items-center justify-between">
      <CardTitle className="text-lg">AI Assistant</CardTitle>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-xs" 
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
                <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                  <Info className="h-3 w-3" />
                  {assistantInfo.model || "Loading model..."}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Model: {assistantInfo.model || "Unknown"}</p>
                {assistantInfo.assistantId && (
                  <p>Assistant ID: {assistantInfo.assistantId}</p>
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
