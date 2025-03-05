
import { useEffect, useState } from "react";
import { JournalEntryForm } from "@/components/JournalEntryForm";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { JournalEntry, mapDatabaseEntryToJournalEntry } from "@/types/journal";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar, Search, Plus, Trash, PenLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { calculateStreakAndXP } from "@/types/streaks";
import { JournalEntryList } from "@/components/journal/JournalEntryList";
import { JournalEntryDetail } from "@/components/journal/JournalEntryDetail";
import { JournalStreakCards } from "@/components/journal/JournalStreakCards";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const Journal = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const userId = session?.user.id;
  const today = format(new Date(), "yyyy-MM-dd");
  
  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    document.title = "Journal | Daily Driver";
  }, []);

  // Query for today's entry
  const { data: todayEntry, isLoading: isTodayLoading, refetch: refetchToday } = useQuery({
    queryKey: ["journal-entry", today],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching journal entry:", error);
        throw error;
      }
      
      return data ? mapDatabaseEntryToJournalEntry(data) : null;
    },
    enabled: !!userId,
  });

  // Query for all journal entries
  const { data: allEntries, isLoading: isEntriesLoading, refetch: refetchAll } = useQuery({
    queryKey: ["journal-entries", userId, searchTerm, dateRange],
    queryFn: async () => {
      if (!userId) return [];
      
      let query = supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      
      if (searchTerm) {
        query = query.or(
          `intentions.ilike.%${searchTerm}%,reflection.ilike.%${searchTerm}%,challenges.ilike.%${searchTerm}%,gratitude.ilike.%${searchTerm}%`
        );
      }
      
      if (dateRange) {
        const formattedDate = format(dateRange, "yyyy-MM-dd");
        query = query.eq("date", formattedDate);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching journal entries:", error);
        throw error;
      }
      
      return data.map(mapDatabaseEntryToJournalEntry);
    },
    enabled: !!userId,
  });

  // Query for streak data
  const { data: streakData } = useQuery({
    queryKey: ["journal-streaks", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("date")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      
      if (error) {
        console.error("Error fetching streak data:", error);
        throw error;
      }
      
      return calculateStreakAndXP(data || []);
    },
    enabled: !!userId,
  });

  // Set first entry as selected when data loads
  useEffect(() => {
    if (allEntries && allEntries.length > 0 && !selectedEntry) {
      setSelectedEntry(allEntries[0]);
    }
  }, [allEntries, selectedEntry]);

  const handleRefresh = async () => {
    await Promise.all([refetchToday(), refetchAll()]);
    toast({
      title: "Refreshed",
      description: "Journal entries have been refreshed",
    });
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsEditing(true);
    setIsCreatingNew(false);
  };

  const handleNewEntry = () => {
    setIsEditing(true);
    setSelectedEntry(null);
    setIsCreatingNew(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    queryClient.invalidateQueries({ queryKey: ["journal-entry", today] });
    queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    setIsCreatingNew(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDateRange(date);
  };

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsEditing(false);
  };

  const confirmDeleteEntry = () => {
    setShowDeleteAlert(true);
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;
    
    try {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", selectedEntry.id);
        
      if (error) throw error;
      
      toast({
        title: "Journal Entry Deleted",
        description: "Your journal entry has been deleted successfully",
      });
      
      // Refetch data and reset selection
      await refetchAll();
      setSelectedEntry(null);
      setShowDeleteAlert(false);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Daily Journal</h1>
          <p className="text-muted-foreground">
            Reflect on your day, capture your thoughts, and track your progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleNewEntry}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            title="Refresh journal entries"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {streakData && <JournalStreakCards streakData={streakData} />}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search journal entries..."
            className="pl-9"
            value={searchTerm}
            onChange={handleSearchChange}
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
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        {dateRange && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setDateRange(undefined)}
          >
            Clear filter
          </Button>
        )}
      </div>

      {isCreatingNew ? (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
          <JournalEntryForm onCancel={handleCancelEdit} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <JournalEntryList 
              entries={allEntries || []}
              isLoading={isEntriesLoading}
              selectedEntryId={selectedEntry?.id}
              onSelectEntry={handleSelectEntry}
              searchTerm={searchTerm}
              dateFilter={dateRange}
            />
          </div>
          
          <div className="lg:col-span-2">
            {!isEditing ? (
              selectedEntry ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Journal Entry for {format(new Date(selectedEntry.date), "MMMM d, yyyy")}
                      </h2>
                      {selectedEntry.date === today && <span className="text-sm text-muted-foreground">Today</span>}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditEntry(selectedEntry)}
                        className="flex items-center gap-1"
                      >
                        <PenLine className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={confirmDeleteEntry} 
                        className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <JournalEntryDetail entry={selectedEntry} />
                </div>
              ) : (
                <Card className="h-full flex items-center justify-center p-8">
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">
                      {isEntriesLoading ? "Loading entries..." :
                        allEntries && allEntries.length > 0 ? 
                          "Select a journal entry to view details" : 
                          "No journal entries found"}
                    </p>
                    {(!allEntries || allEntries.length === 0) && !isEntriesLoading && (
                      <Button onClick={handleNewEntry}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Entry
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            ) : (
              <div className="animate-fade-in">
                <JournalEntryForm
                  existingEntry={selectedEntry || undefined}
                  onCancel={handleCancelEdit}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this journal entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntry} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Journal;
