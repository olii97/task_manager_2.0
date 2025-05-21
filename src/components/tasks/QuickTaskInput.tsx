import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Info } from "lucide-react";
import { callOpenAIProxy } from "@/services/openaiClientService";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuickTaskInputProps {
  onTaskCreated: (task: any) => void;
}

export function QuickTaskInput({ onTaskCreated }: QuickTaskInputProps) {
  const [taskText, setTaskText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task description",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const openAIResponse = await callOpenAIProxy({ prompt: taskText });
      
      let taskData = openAIResponse.content;
      if (typeof taskData === 'string') {
        try {
          taskData = JSON.parse(taskData);
        } catch (parseError) {
          console.warn("OpenAI response content was not valid JSON, using as string:", taskData);
        }
      }

      if (!taskData || typeof taskData !== 'object' || !taskData.title) {
          console.error("Processed task data is not in the expected format:", taskData);
          toast({
              title: "AI Processing Error",
              description: "The AI response could not be processed correctly. Please try a different phrasing.",
              variant: "destructive",
          });
          throw new Error("AI response processing error");
      }

      onTaskCreated(taskData);
      setTaskText("");
      toast({
        title: "Success",
        description: `Created task: "${taskData.title}"`,
      });
    } catch (error: any) {
      console.error("Failed to create task via AI proxy:", error);
      const errorMessage = error.message || "An unexpected error occurred. Please try again.";
      toast({
        title: "Error Creating Task",
        description: errorMessage.length < 100 ? errorMessage : "Failed to process task with AI.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-grow">
        <Sparkles className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
        <Input
          type="text"
          placeholder="Add task with AI"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          className="pl-8 h-8 text-sm border-solid border-2 border-purple-200 focus:border-purple-400 hover:border-purple-300 transition-colors bg-white"
          disabled={isProcessing}
        />
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                type="button" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={(e) => e.preventDefault()}
              >
                <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] p-3 text-xs">
              <p className="font-semibold mb-1">AI Task Creation</p>
              <p className="mb-1">Enter a task description and the AI will automatically:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Create a clear, concise title</li>
                <li>Determine the priority level (1-4)</li>
                <li>Set the appropriate energy level (high/low)</li>
                <li>Categorize the task (Consume, Create, Care, Connect)</li>
                <li>Identify if it's work or personal</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Button 
        type="submit" 
        disabled={isProcessing} 
        size="sm" 
        variant="secondary"
        className="h-8 px-3 text-xs whitespace-nowrap"
      >
        {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Create"}
      </Button>
    </form>
  );
} 