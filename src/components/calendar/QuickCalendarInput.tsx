import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { analyzeCalendarText } from "@/services/calendar/quickCalendarService";
import { toast } from "@/hooks/use-toast";

interface QuickCalendarInputProps {
  onEntryCreated: (entry: any) => void;
}

export function QuickCalendarInput({ onEntryCreated }: QuickCalendarInputProps) {
  const [entryText, setEntryText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entryText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a calendar entry description",
        variant: "destructive",
      });
      return;
    }

    console.log("Processing calendar input:", entryText);
    setIsProcessing(true);
    
    try {
      // Use the direct approach with added logging
      console.log("Starting calendar text analysis...");
      const entryData = await analyzeCalendarText(entryText);
      console.log("Successfully analyzed text:", entryData);
      
      onEntryCreated(entryData);
      setEntryText("");
      toast({
        title: "Success",
        description: `Created entry: "${entryData.title}"`,
      });
    } catch (error) {
      console.error("Failed to create calendar entry:", error);
      toast({
        title: "Error",
        description: "Could not create entry. Please try adding it manually.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-grow">
        <Sparkles className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
        <Input
          type="text"
          placeholder="Add calendar entry with AI (e.g., 'Meeting with team tomorrow at 2pm')"
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
          className="pl-8 h-10 text-sm"
          disabled={isProcessing}
        />
      </div>
      <Button 
        type="submit" 
        disabled={isProcessing} 
        size="sm" 
        variant="secondary"
        className="h-10 px-4"
      >
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
      </Button>
    </form>
  );
} 