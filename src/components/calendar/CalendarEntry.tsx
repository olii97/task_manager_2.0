import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarEntry as CalendarEntryType } from "@/services/calendar/calendarService";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateCalendarEntryStatus, deleteCalendarEntry } from "@/services/calendar/calendarService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CalendarEntryProps {
  entry: CalendarEntryType;
  onEdit: (entry: CalendarEntryType) => void;
}

export function CalendarEntry({ entry, onEdit }: CalendarEntryProps) {
  const queryClient = useQueryClient();
  
  const { mutate: toggleStatus } = useMutation({
    mutationFn: ({ entryId, status }: { entryId: string; status: 'pending' | 'completed' | 'cancelled' }) => 
      updateCalendarEntryStatus(entryId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    }
  });

  const { mutate: onDeleteEntry } = useMutation({
    mutationFn: (entryId: string) => deleteCalendarEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    }
  });

  const handleStatusChange = (checked: boolean | string) => {
    const isCompleted = checked === "indeterminate" ? false : !!checked;
    
    toggleStatus({
      entryId: entry.id,
      status: isCompleted ? 'completed' : 'pending'
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      onDeleteEntry(entry.id);
    }
  };

  const isCompleted = entry.status === 'completed';
  const isWorkType = entry.entry_type === 'work';

  return (
    <div className={cn(
      "group relative mb-2 rounded-lg border bg-card overflow-hidden",
      "hover:border-accent-foreground/20 transition-colors",
      isCompleted ? "bg-muted/40" : "bg-card"
    )}>
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1",
        isWorkType ? "bg-blue-500" : "bg-purple-500"
      )} />
      <div className="p-3 pl-4 flex items-start">
        {isWorkType && (
          <div className="flex-shrink-0 mr-3 mt-1">
            <Checkbox 
              checked={isCompleted} 
              onCheckedChange={handleStatusChange}
              aria-label={isCompleted ? "Mark as pending" : "Mark as complete"}
              className={isCompleted ? "opacity-70" : ""}
            />
          </div>
        )}
        <div className="flex-grow min-w-0">
          <div className="flex items-center flex-wrap gap-1">
            <span className={cn(
              "text-sm font-medium truncate",
              isCompleted ? "line-through text-muted-foreground" : ""
            )}>
              {entry.title}
            </span>
            {entry.is_recurring && (
              <span className="text-xs px-1.5 py-0.5 bg-secondary rounded-full flex items-center">
                <RefreshCw className="h-3 w-3 mr-1" />
                {entry.recurrence_pattern || 'recurring'}
              </span>
            )}
          </div>
          {entry.description && (
            <p className={cn(
              "text-xs text-muted-foreground mt-0.5 line-clamp-1",
              isCompleted ? "line-through" : ""
            )}>
              {entry.description}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 ml-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={() => onEdit(entry)}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-destructive" 
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 