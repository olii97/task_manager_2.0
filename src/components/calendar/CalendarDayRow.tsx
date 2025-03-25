import React from "react";
import { CalendarEntry as CalendarEntryType } from "@/services/calendar/calendarService";
import { CalendarEntry } from "./CalendarEntry";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CalendarDayRowProps {
  date: Date;
  workEntries: CalendarEntryType[];
  personalEntries: CalendarEntryType[];
  onAddEntry: (date: Date, entryType: 'work' | 'personal') => void;
  onEditEntry: (entry: CalendarEntryType) => void;
}

export function CalendarDayRow({
  date,
  workEntries,
  personalEntries,
  onAddEntry,
  onEditEntry
}: CalendarDayRowProps) {
  // Format the date to show day of month and short month name (e.g., "5 MAR")
  const formattedDate = formatDate(date, "d MMM").toUpperCase();
  
  // Determine if this is today's date
  const isToday = new Date().toDateString() === date.toDateString();
  
  return (
    <div className={`grid grid-cols-[100px_1fr_1fr] border-b min-h-[130px] ${isToday ? 'bg-muted/30' : ''}`}>
      {/* Date column */}
      <div className="flex flex-col items-center justify-center border-r p-3">
        <div className={`text-2xl font-medium mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
          {date.getDate()}
        </div>
        <div className="text-sm text-muted-foreground">
          {formatDate(date, "MMM EEE").toUpperCase()}
        </div>
      </div>
      
      {/* Work entries column */}
      <div className="border-r p-3 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-blue-600">Work</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full" 
            onClick={() => onAddEntry(date, 'work')}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div className="flex-grow">
          {workEntries.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No work items for this day</p>
          ) : (
            workEntries.map(entry => (
              <CalendarEntry 
                key={entry.id} 
                entry={entry} 
                onEdit={onEditEntry} 
              />
            ))
          )}
        </div>
      </div>
      
      {/* Personal entries column */}
      <div className="p-3 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-purple-600">Personal</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full" 
            onClick={() => onAddEntry(date, 'personal')}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div className="flex-grow">
          {personalEntries.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No personal items for this day</p>
          ) : (
            personalEntries.map(entry => (
              <CalendarEntry 
                key={entry.id} 
                entry={entry} 
                onEdit={onEditEntry} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
} 