
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapDatabaseEntryToJournalEntry } from "@/types/journal";
import { format } from "date-fns";

export const useJournalEntry = (userId: string | undefined) => {
  const today = format(new Date(), "yyyy-MM-dd");
  const queryClient = useQueryClient();

  const { data: todayEntry, isLoading } = useQuery({
    queryKey: ["journal-entry", today],
    queryFn: async () => {
      if (!userId) return null;
      
      console.log("Fetching today's entry in useJournalEntry for date:", today);
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching journal entry:", error);
        throw error;
      }
      
      return data ? mapDatabaseEntryToJournalEntry(data) : null;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const refreshTodayEntry = () => {
    queryClient.invalidateQueries({ queryKey: ["journal-entry", today] });
  };

  return { todayEntry, isLoading, refreshTodayEntry };
};
