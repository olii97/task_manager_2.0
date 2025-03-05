
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

interface JournalHeaderProps {
  onNewEntry: () => void;
  onRefresh: () => void;
}

export function JournalHeader({ onNewEntry, onRefresh }: JournalHeaderProps) {
  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Daily Journal</h1>
        <p className="text-muted-foreground">
          Reflect on your day, capture your thoughts, and track your progress.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          onClick={onNewEntry}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh}
          title="Refresh journal entries"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
