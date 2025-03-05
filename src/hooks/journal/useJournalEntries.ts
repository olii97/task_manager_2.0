
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { JournalEntry, mapDatabaseEntryToJournalEntry } from "@/types/journal";

// Hook for fetching all journal entries with filtering capabilities
export const useJournalEntries = (userId: string | undefined, searchTerm: string, dateRange: Date | undefined) => {
  return useQuery({
    queryKey: ["journal-entries", userId, searchTerm, dateRange],
    queryFn: async () => {
      if (!userId) return [];
      
      let query = supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .order("updated_at", { ascending: false });
      
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
      
      // Ensure we don't have duplicate entries by using a Map with the entry date as key
      const uniqueEntries = new Map();
      data.forEach(entry => {
        // Use date as the unique key
        const dateKey = entry.date;
        
        // Only replace if this entry is newer (has a more recent updated_at)
        if (!uniqueEntries.has(dateKey) || 
            parseISO(entry.updated_at) > parseISO(uniqueEntries.get(dateKey).updated_at)) {
          uniqueEntries.set(dateKey, mapDatabaseEntryToJournalEntry(entry));
        }
      });
      
      // Convert Map back to array and sort by date (newest first)
      return Array.from(uniqueEntries.values()).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
