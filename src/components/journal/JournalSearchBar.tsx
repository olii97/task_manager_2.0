
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Search, Calendar } from "lucide-react";
import { format } from "date-fns";

interface JournalSearchBarProps {
  searchTerm: string;
  dateRange: Date | undefined;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateSelect: (date: Date | undefined) => void;
}

export function JournalSearchBar({
  searchTerm,
  dateRange,
  onSearchChange,
  onDateSelect
}: JournalSearchBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search journal entries..."
          className="pl-9"
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {dateRange ? format(dateRange, "PPP") : "Filter by date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <CalendarComponent
            mode="single"
            selected={dateRange}
            onSelect={onDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {dateRange && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDateSelect(undefined)}
        >
          Clear filter
        </Button>
      )}
    </div>
  );
}
