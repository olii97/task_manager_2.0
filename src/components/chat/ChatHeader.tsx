import React, { useState } from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ToggleLeft, ToggleRight, Copy, Beaker, Settings, Bot, User, Ear, EarOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AssistantInfo } from './types';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ChatHeaderProps {
  assistantInfo: AssistantInfo | null;
  useAssistant: boolean;
  toggleChatMode: () => void;
  threadId?: string | null;
  showTestPanel?: boolean;
  toggleTestPanel?: () => void;
  isListenerEnabled?: boolean;
  toggleListeners?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  assistantInfo, 
  useAssistant, 
  toggleChatMode,
  threadId,
  showTestPanel,
  toggleTestPanel,
  isListenerEnabled,
  toggleListeners
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
      duration: 2000,
    });
  };

  return (
    <CardHeader className="pb-3 flex flex-col bg-stone-100 border-b border-stone-200">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg text-stone-800">AI Assistant</CardTitle>
          {assistantInfo && assistantInfo.assistantId && (
            <Badge variant="outline" className="bg-stone-200 text-stone-700 border-stone-300 text-xs">
              {assistantInfo.model || "gpt-4o-mini"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Listener Toggle */}
          {toggleListeners && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`h-8 px-2 text-xs border ${isListenerEnabled 
                      ? 'border-green-500 text-green-700 hover:bg-green-50' 
                      : 'border-gray-500 text-gray-700 hover:bg-gray-50'}`}
                    onClick={toggleListeners}
                  >
                    {isListenerEnabled ? (
                      <Ear className="h-4 w-4 mr-1" />
                    ) : (
                      <EarOff className="h-4 w-4 mr-1" />
                    )}
                    {isListenerEnabled ? 'Listeners On' : 'Listeners Off'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isListenerEnabled ? "Disable listeners" : "Enable listeners"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {toggleTestPanel && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2 text-xs border-amber-500 text-amber-700 hover:bg-amber-50" 
              onClick={toggleTestPanel}
            >
              <Beaker className="h-4 w-4 mr-1" />
              {showTestPanel ? 'Hide Test' : 'Show Test'}
            </Button>
          )}
          
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
                  {toggleListeners && (
                    <p>Listeners: <strong className={isListenerEnabled ? "text-green-700" : "text-gray-700"}>
                      {isListenerEnabled ? "Enabled" : "Disabled"}
                    </strong></p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {/* Display IDs section */}
      {useAssistant && (
        <div className="mt-2 grid grid-cols-1 gap-1 bg-stone-50 p-2 rounded-md text-xs border border-stone-200">
          {assistantInfo?.assistantId && (
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Assistant ID:</span>
              <div className="flex items-center">
                <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-amber-700 max-w-[240px] truncate">
                  {assistantInfo.assistantId}
                </code>
                <button 
                  onClick={() => copyToClipboard(assistantInfo.assistantId!, "Assistant ID")}
                  className="ml-1 text-stone-500 hover:text-stone-700"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
          
          {threadId && (
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Thread ID:</span>
              <div className="flex items-center">
                <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-amber-700 max-w-[240px] truncate">
                  {threadId}
                </code>
                <button 
                  onClick={() => copyToClipboard(threadId, "Thread ID")}
                  className="ml-1 text-stone-500 hover:text-stone-700"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </CardHeader>
  );
};

export default ChatHeader;
