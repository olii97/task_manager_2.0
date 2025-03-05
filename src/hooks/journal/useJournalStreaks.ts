
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Hook for calculating streak data
export const useJournalStreaks = (userId: string | undefined) => {
  return useQuery({
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
};
