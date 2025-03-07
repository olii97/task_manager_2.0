
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AssistantInfo } from './types';

interface ChatHeaderProps {
  assistantInfo: AssistantInfo | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ assistantInfo }) => {
  return (
    <CardHeader className="pb-3 flex flex-row items-center justify-between">
      <CardTitle className="text-lg">AI Assistant</CardTitle>
      {assistantInfo && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                <Info className="h-3 w-3" />
                {assistantInfo.model}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Model: {assistantInfo.model}</p>
              {assistantInfo.assistantId && (
                <p>Assistant ID: {assistantInfo.assistantId}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </CardHeader>
  );
};

export default ChatHeader;
