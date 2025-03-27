import React, { useState, useRef, useEffect } from "react";
import { CalendarEntry as CalendarEntryType, NewCalendarEntry, addCalendarEntry, fetchUpcomingReminders, checkDueReminders } from "@/services/calendar/calendarService";
import { QuickCalendarInput } from "./QuickCalendarInput";
import { CalendarDayRow } from "./CalendarDayRow";
import { CalendarEntryForm } from "./CalendarEntryForm";
import { ReminderSidebar } from "./ReminderSidebar";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { addDays, subDays, startOfDay, format, isToday, subMonths, isBefore, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronUp, ChevronDown } from "lucide-react";

/**
 * Convert a Date to YYYY-MM-DD format in local timezone
 */
const formatDateToLocalDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

interface VerticalCalendarProps {
  entries: CalendarEntryType[];
  userId: string;
  daysToShow?: number;
  startDate?: Date;
  endDate?: Date;
}

export function VerticalCalendar({ 
  entries, 
  userId, 
  daysToShow = 14,
  startDate,
  endDate 
}: VerticalCalendarProps) {
  const queryClient = useQueryClient();
  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalendarEntryType | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedType, setSelectedType] = useState<'work' | 'personal'>('personal');
  const calendarRef = useRef<HTMLDivElement>(null);
  const todayRowRef = useRef<HTMLDivElement>(null);
  const [showEarlierEntries, setShowEarlierEntries] = useState(false);
  const [initialViewDays, setInitialViewDays] = useState(60); // Show 60 days initially

  // Fetch reminders
  const { data: reminders = [] } = useQuery({
    queryKey: ["reminders", userId],
    queryFn: () => fetchUpcomingReminders(userId),
    enabled: !!userId
  });

  // Generate a range of dates
  const today = startOfDay(new Date());
  const dateStart = startDate ? startOfDay(startDate) : today;
  const dateEnd = endDate ? startOfDay(endDate) : addDays(today, daysToShow);
  
  // Calculate total days to show if startDate and endDate are provided
  const totalDaysToShow = startDate && endDate 
    ? Math.ceil((dateEnd.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24)) 
    : daysToShow;
  
  // Generate an array of dates
  const allDates = Array.from({ length: totalDaysToShow }, (_, i) => {
    return addDays(dateStart, i);
  });

  // Filter dates based on showEarlierEntries state
  const dates = showEarlierEntries 
    ? allDates 
    : allDates.filter(date => !isBefore(date, today));

  // Scroll to today's date when component mounts or when toggling earlier entries
  useEffect(() => {
    if (todayRowRef.current && calendarRef.current) {
      todayRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [entries, showEarlierEntries]);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Check for due reminders on mount and every 5 minutes
  useEffect(() => {
    if (!userId) return;

    // Check immediately on mount
    checkDueReminders(userId);

    // Then check every 5 minutes
    const interval = setInterval(() => {
      checkDueReminders(userId);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userId]);

  // Add calendar entry mutation
  const { mutate: addEntryMutation } = useMutation({
    mutationFn: (entry: NewCalendarEntry) => addCalendarEntry(userId, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      setEntryFormOpen(false);
      setEditingEntry(undefined);
    }
  });

  // Group entries by date
  const entriesByDate = dates.map(date => {
    const dateStr = formatDateToLocalDate(date);
    const dayEntries = entries.filter(entry => entry.date === dateStr);
    
    return {
      date,
      workEntries: dayEntries.filter(entry => entry.entry_type === 'work'),
      personalEntries: dayEntries.filter(entry => entry.entry_type === 'personal')
    };
  });

  const handleAddEntry = (date: Date, entryType: 'work' | 'personal') => {
    setSelectedDate(startOfDay(date));
    setSelectedType(entryType);
    setEditingEntry(undefined);
    setEntryFormOpen(true);
  };

  const handleEditEntry = (entry: CalendarEntryType) => {
    setEditingEntry(entry);
    // When editing, ensure the date is properly parsed from the string
    setSelectedDate(startOfDay(parseISO(entry.date)));
    setEntryFormOpen(true);
  };

  const handleQuickEntryCreated = (entryData: NewCalendarEntry) => {
    addEntryMutation(entryData);
  };

  const handleSaveEntry = (entryData: NewCalendarEntry) => {
    addEntryMutation(entryData);
  };

  const scrollToToday = () => {
    if (todayRowRef.current) {
      todayRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleEarlierEntries = () => {
    setShowEarlierEntries(!showEarlierEntries);
  };

  return (
    <div className="flex h-full gap-4">
      {/* Main calendar section */}
      <div className="flex flex-col h-full flex-grow">
        {/* Quick Add with AI */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Quick Add Calendar Entry</h2>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleEarlierEntries}
                className="flex items-center gap-1"
              >
                {showEarlierEntries ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>Hide Earlier Entries</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>Show Earlier Entries</span>
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={scrollToToday}
                className="flex items-center gap-1"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>Today</span>
              </Button>
            </div>
          </div>
          <QuickCalendarInput onEntryCreated={handleQuickEntryCreated} />
        </div>
        
        {/* Calendar header */}
        <div className="grid grid-cols-[100px_1fr_1fr] border-b border-t font-medium text-sm bg-muted/50 sticky top-0 z-10">
          <div className="p-3 border-r text-center">Date</div>
          <div className="p-3 border-r text-center text-blue-600">Work</div>
          <div className="p-3 text-center text-purple-600">Personal</div>
        </div>
        
        {/* Calendar body - scrollable */}
        <div className="flex-grow overflow-y-auto" ref={calendarRef}>
          {entriesByDate.map(({ date, workEntries, personalEntries }) => (
            <div 
              key={date.toISOString()}
              ref={isToday(date) ? todayRowRef : null}
              className={isToday(date) ? "border-l-4 border-primary" : ""}
            >
              <CalendarDayRow
                date={date}
                workEntries={workEntries}
                personalEntries={personalEntries}
                onAddEntry={handleAddEntry}
                onEditEntry={handleEditEntry}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Reminder sidebar */}
      <div className="w-[300px]">
        <ReminderSidebar reminders={reminders} />
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