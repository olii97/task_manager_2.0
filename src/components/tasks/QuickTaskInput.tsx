import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { analyzeTaskText } from "@/services/quickTaskService";
import { toast } from "@/hooks/use-toast";
import { Project } from "@/types/projects";

interface QuickTaskInputProps {
  onTaskCreated: (task: any) => void;
  projects?: Project[];
}

export function QuickTaskInput({ onTaskCreated, projects = [] }: QuickTaskInputProps) {
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
      const taskData = await analyzeTaskText(taskText, projects);
      onTaskCreated(taskData);
      setTaskText("");
      toast({
        title: "Success",
        description: `Created task: "${taskData.title}"`,
      });
    } catch (error) {
      console.error("Failed to create task:", error);
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
          className="pl-8 h-8 text-xs"
          disabled={isProcessing}
        />
      </div>
      <Button 
        type="submit" 
        disabled={isProcessing} 
        size="sm" 
        variant="secondary"
        className="h-8 px-3 text-xs"
      >
        {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Create"}
      </Button>
    </form>
  );
} 