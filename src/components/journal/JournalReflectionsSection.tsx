
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReflectionEntry } from "@/types/journal";
import { format, parseISO } from "date-fns";
import { Send, Clock } from "lucide-react";

interface JournalReflectionsSectionProps {
  reflections: ReflectionEntry[] | null;
  onAddReflection: (content: string) => void;
  newReflection: string;
  setNewReflection: (value: string) => void;
}

export const JournalReflectionsSection = ({
  reflections,
  onAddReflection,
  newReflection,
  setNewReflection
}: JournalReflectionsSectionProps) => {
  const sortedReflections = reflections
    ? [...reflections].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    : [];

  const handleAddReflection = () => {
    if (newReflection.trim()) {
      onAddReflection(newReflection);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddReflection();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {sortedReflections.map((reflection, index) => (
          <div key={index} className="rounded-md bg-muted/50 p-3">
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <Clock className="h-3 w-3 mr-1" />
              {format(parseISO(reflection.timestamp), "PPp")}
            </div>
            <p className="whitespace-pre-wrap text-sm">{reflection.content}</p>
          </div>
        ))}
      </div>

      <div className="border rounded-md bg-card p-3">
        <h3 className="text-sm font-medium mb-2">Add a new reflection</h3>
        <Textarea
          placeholder="What's on your mind right now?"
          value={newReflection}
          onChange={(e) => setNewReflection(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[150px] mb-2 resize-y"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleAddReflection}
            disabled={!newReflection.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            Add Reflection
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Pro tip: Press Ctrl+Enter to quickly add your reflection
        </p>
      </div>
    </div>
  );
};
