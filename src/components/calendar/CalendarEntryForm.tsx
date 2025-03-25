import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Briefcase, User } from "lucide-react";
import { CalendarEntry, NewCalendarEntry } from "@/services/calendar/calendarService";
import { cn, formatDate } from "@/lib/utils";

interface CalendarEntryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (entryData: NewCalendarEntry) => void;
  entry?: CalendarEntry;
  title: string;
  initialDate?: Date;
  initialType?: 'work' | 'personal';
}

export function CalendarEntryForm({
  open,
  onClose,
  onSave,
  entry,
  title,
  initialDate = new Date(),
  initialType = 'personal'
}: CalendarEntryFormProps) {
  const [formData, setFormData] = useState<NewCalendarEntry>({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    entry_type: 'personal',
    status: 'pending',
    is_recurring: false,
    recurrence_pattern: undefined,
  });

  const [date, setDate] = useState<Date>(initialDate);

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title,
        description: entry.description || "",
        date: entry.date,
        entry_type: entry.entry_type,
        status: entry.status || 'pending',
        is_recurring: entry.is_recurring,
        recurrence_pattern: entry.recurrence_pattern,
      });
      setDate(new Date(entry.date));
    } else {
      setFormData({
        title: "",
        description: "",
        date: initialDate.toISOString().split('T')[0],
        entry_type: initialType,
        status: 'pending',
        is_recurring: false,
        recurrence_pattern: undefined,
      });
      setDate(initialDate);
    }
  }, [entry, initialDate, initialType, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setFormData((prev) => ({ 
        ...prev, 
        date: newDate.toISOString().split('T')[0]
      }));
    }
  };

  const handleEntryTypeChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      entry_type: value as 'work' | 'personal'
    }));
  };

  const handleRecurringChange = (checked: boolean) => {
    setFormData((prev) => ({ 
      ...prev, 
      is_recurring: checked,
      recurrence_pattern: checked ? (prev.recurrence_pattern || 'weekly') : undefined
    }));
  };

  const handleRecurrencePatternChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      recurrence_pattern: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Entry title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any details about this entry"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? formatDate(date) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Entry Type</Label>
            <RadioGroup
              value={formData.entry_type}
              onValueChange={handleEntryTypeChange}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="work" id="work" />
                <Label htmlFor="work" className="flex items-center cursor-pointer">
                  <Briefcase className="h-4 w-4 mr-1 text-blue-500" />
                  Work
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal" className="flex items-center cursor-pointer">
                  <User className="h-4 w-4 mr-1 text-purple-500" />
                  Personal
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="is_recurring" 
              checked={formData.is_recurring}
              onCheckedChange={handleRecurringChange}
            />
            <Label htmlFor="is_recurring">Recurring Event</Label>
          </div>

          {formData.is_recurring && (
            <div className="space-y-2">
              <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
              <Select
                value={formData.recurrence_pattern || 'weekly'}
                onValueChange={handleRecurrencePatternChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 