
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntry } from "@/types/journal";

export function useJournalOperations() {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteJournalEntry = async (entryId: string) => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", entryId);
      
      if (error) throw error;
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["journal-entry"] });
      queryClient.invalidateQueries({ queryKey: ["journal-streaks"] });
      
      toast({
        title: "Entry deleted",
        description: "Journal entry has been deleted successfully",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting entry",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteJournalEntry,
    isDeleting
  };
}
