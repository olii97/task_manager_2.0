import React, { useState } from "react";
import { CalendarEntry as CalendarEntryType, NewCalendarEntry, addCalendarEntry } from "@/services/calendar/calendarService";
import { QuickCalendarInput } from "./QuickCalendarInput";
import { CalendarDayRow } from "./CalendarDayRow";
import { CalendarEntryForm } from "./CalendarEntryForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, subDays, startOfDay } from "date-fns";

interface VerticalCalendarProps {
  entries: CalendarEntryType[];
  userId: string;
  daysToShow?: number;
}

export function VerticalCalendar({ entries, userId, daysToShow = 14 }: VerticalCalendarProps) {
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
    <div className="flex flex-col h-full">
      {/* Quick Add with AI */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Quick Add Calendar Entry</h2>
        <QuickCalendarInput onEntryCreated={handleQuickEntryCreated} />
      </div>
      
      {/* Calendar header */}
      <div className="grid grid-cols-[100px_1fr_1fr] border-b border-t font-medium text-sm bg-muted/50">
        <div className="p-3 border-r text-center">Date</div>
        <div className="p-3 border-r text-center text-blue-600">Work</div>
        <div className="p-3 text-center text-purple-600">Personal</div>
      </div>
      
      {/* Calendar body - scrollable */}
      <div className="flex-grow overflow-y-auto">
        {entriesByDate.map(({ date, workEntries, personalEntries }) => (
          <CalendarDayRow
            key={date.toISOString()}
            date={date}
            workEntries={workEntries}
            personalEntries={personalEntries}
            onAddEntry={handleAddEntry}
            onEditEntry={handleEditEntry}
          />
        ))}
      </div>
      
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
    </div>
  );
} 