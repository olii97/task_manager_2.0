import React, { useState } from "react";
import { CalendarEntry as CalendarEntryType, NewCalendarEntry, addCalendarEntry } from "@/services/calendar/calendarService";
import { QuickCalendarInput } from "./QuickCalendarInput";
import { CalendarDayRow } from "./CalendarDayRow";
import { CalendarEntryForm } from "./CalendarEntryForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, startOfDay } from "date-fns";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface VerticalCalendarWidgetProps {
  entries: CalendarEntryType[];
  userId: string;
  daysToShow?: number;
  isLoading?: boolean;
}

export function VerticalCalendarWidget({ 
  entries, 
  userId, 
  daysToShow = 7,
  isLoading = false
}: VerticalCalendarWidgetProps) {
  const queryClient = useQueryClient();
  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalendarEntryType | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedType, setSelectedType] = useState<'work' | 'personal'>('personal');

  // Generate a range of dates from today
  const today = startOfDay(new Date());
  const dates = Array.from({ length: daysToShow }, (_, i) => addDays(today, i));

  // Add calendar entry mutation
  const { mutate: addEntryMutation } = useMutation({
    mutationFn: (entry: NewCalendarEntry) => addCalendarEntry(userId, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      setEntryFormOpen(false);
      setEditingEntry(undefined);
    }
  });

  // Group entries by date
  const entriesByDate = dates.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEntries = entries.filter(entry => entry.date === dateStr);
    
    return {
      date,
      workEntries: dayEntries.filter(entry => entry.entry_type === 'work'),
      personalEntries: dayEntries.filter(entry => entry.entry_type === 'personal')
    };
  });

  const handleAddEntry = (date: Date, entryType: 'work' | 'personal') => {
    setSelectedDate(date);
    setSelectedType(entryType);
    setEditingEntry(undefined);
    setEntryFormOpen(true);
  };

  const handleEditEntry = (entry: CalendarEntryType) => {
    setEditingEntry(entry);
    setEntryFormOpen(true);
  };

  const handleQuickEntryCreated = (entryData: NewCalendarEntry) => {
    addEntryMutation(entryData);
  };

  const handleSaveEntry = (entryData: NewCalendarEntry) => {
    addEntryMutation(entryData);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[calc(100%-110px)]">
        {/* Quick Add with AI */}
        <div className="px-4 py-3 border-b">
          <QuickCalendarInput onEntryCreated={handleQuickEntryCreated} />
        </div>
        
        {/* Calendar header */}
        <div className="grid grid-cols-[80px_1fr_1fr] border-b font-medium text-xs bg-muted/50">
          <div className="p-2 border-r text-center">Date</div>
          <div className="p-2 border-r text-center text-blue-600">Work</div>
          <div className="p-2 text-center text-purple-600">Personal</div>
        </div>
        
        {/* Calendar body - scrollable */}
        <div className="flex-grow overflow-y-auto">
          {entriesByDate.map(({ date, workEntries, personalEntries }) => (
            <div key={date.toISOString()} className="grid grid-cols-[80px_1fr_1fr] border-b min-h-[100px]">
              {/* Date column */}
              <div className="flex flex-col items-center justify-center border-r p-2">
                <div className="text-xl font-medium">
                  {date.getDate()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short' }).toUpperCase()}
                </div>
              </div>
              
              {/* Work entries column */}
              <div className="border-r p-2 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xs font-medium text-blue-600">Work</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 rounded-full absolute top-1 right-1" 
                    onClick={() => handleAddEntry(date, 'work')}
                  >
                    <span className="sr-only">Add work entry</span>
                    <span className="text-xs">+</span>
                  </Button>
                </div>
                
                <div className="flex-grow text-xs">
                  {workEntries.slice(0, 2).map(entry => (
                    <div 
                      key={entry.id} 
                      className="mb-1 truncate cursor-pointer hover:bg-muted/50 rounded p-1"
                      onClick={() => handleEditEntry(entry)}
                    >
                      {entry.title}
                    </div>
                  ))}
                  {workEntries.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{workEntries.length - 2} more
                    </div>
                  )}
                </div>
              </div>
              
              {/* Personal entries column */}
              <div className="p-2 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xs font-medium text-purple-600">Personal</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 rounded-full absolute top-1 right-1" 
                    onClick={() => handleAddEntry(date, 'personal')}
                  >
                    <span className="sr-only">Add personal entry</span>
                    <span className="text-xs">+</span>
                  </Button>
                </div>
                
                <div className="flex-grow text-xs">
                  {personalEntries.slice(0, 2).map(entry => (
                    <div 
                      key={entry.id} 
                      className="mb-1 truncate cursor-pointer hover:bg-muted/50 rounded p-1"
                      onClick={() => handleEditEntry(entry)}
                    >
                      {entry.title}
                    </div>
                  ))}
                  {personalEntries.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{personalEntries.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-2 pb-3">
        <Button variant="outline" size="sm" asChild>
          <Link to="/calendar">View Full Calendar</Link>
        </Button>
      </CardFooter>
      
      {/* Entry form dialog */}
      <CalendarEntryForm
        open={entryFormOpen}
        onClose={() => {
          setEntryFormOpen(false);
          setEditingEntry(undefined);
        }}
        onSave={handleSaveEntry}
        entry={editingEntry}
        title={editingEntry ? "Edit Calendar Entry" : "Add Calendar Entry"}
        initialDate={selectedDate}
        initialType={selectedType}
      />
    </Card>
  );
} 