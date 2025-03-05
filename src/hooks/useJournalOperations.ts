
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { JournalEntry, mapDatabaseEntryToJournalEntry } from "@/types/journal";
import { useToast } from "@/components/ui/use-toast";

export const useJournalOperations = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Query for today's entry
  const { isLoading: isTodayLoading, refetch: refetchToday } = useQuery({
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
      
      const { calculateStreakAndXP } = await import("@/types/streaks");
      return calculateStreakAndXP(data || []);
    },
    enabled: !!userId,
  });

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

  return {
    today,
    searchTerm,
    setSearchTerm,
    dateRange,
    selectedEntry,
    showDeleteAlert,
    setShowDeleteAlert,
    isEditing,
    isCreatingNew,
    isTodayLoading,
    isEntriesLoading,
    allEntries,
    streakData,
    handleRefresh,
    handleEditEntry,
    handleNewEntry,
    handleCancelEdit,
    handleSearchChange,
    handleDateSelect,
    handleSelectEntry,
    confirmDeleteEntry,
    handleDeleteEntry
  };
};
