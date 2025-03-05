
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { JournalEntry, ReflectionEntry } from "@/types/journal";
import { useToast } from "@/components/ui/use-toast";

// Hook for journal CRUD operations
export const useJournalActions = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  
  // State for deletion
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  // Add a reflection to an existing journal entry
  const addReflection = async (entryId: string, content: string) => {
    if (!userId || !content.trim()) return;
    
    try {
      const timestamp = new Date().toISOString();
      const newReflectionEntry: ReflectionEntry = {
        timestamp,
        content: content.trim()
      };
      
      // First get the current entry to get existing reflections
      const { data: currentEntry, error: fetchError } = await supabase
        .from("journal_entries")
        .select("reflections")
        .eq("id", entryId)
        .eq("user_id", userId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching journal entry for reflection:", fetchError);
        throw fetchError;
      }
      
      // Prepare the reflections array
      let reflections: ReflectionEntry[] = [];
      
      if (currentEntry.reflections) {
        reflections = [...currentEntry.reflections];
      }
      
      // Add the new reflection
      reflections.push(newReflectionEntry);
      
      // Update the entry with the new reflections array
      const { error } = await supabase
        .from("journal_entries")
        .update({ 
          reflections: reflections,
          updated_at: timestamp
        })
        .eq("id", entryId)
        .eq("user_id", userId);
      
      if (error) {
        console.error("Error updating journal entry with new reflection:", error);
        throw error;
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["journal-entry", today] });
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      
      toast({
        title: "Reflection Added",
        description: "Your reflection has been added successfully",
      });
      
    } catch (error: any) {
      console.error("Error adding reflection:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add reflection",
        variant: "destructive",
      });
    }
  };
  
  // Delete a journal entry
  const handleDeleteEntry = async (selectedEntry: JournalEntry | null) => {
    if (!selectedEntry || !userId) return;
    
    setIsDeleting(true);
    
    try {
      console.log("Deleting journal entry with ID:", selectedEntry.id);
      
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", selectedEntry.id)
        .eq("user_id", userId);
        
      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }
      
      // Invalidate both queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["journal-entry", today] });
      queryClient.invalidateQueries({ queryKey: ["journal-streaks", userId] });
      
      toast({
        title: "Journal Entry Deleted",
        description: "Your journal entry has been deleted successfully",
      });
      
      // Close delete confirmation
      setShowDeleteAlert(false);
      
    } catch (error: any) {
      console.error("Error deleting journal entry:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete journal entry",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Refresh journal data
  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["journal-entry", today] }),
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] })
    ]);
    
    toast({
      title: "Refreshed",
      description: "Journal entries have been refreshed",
    });
  };
  
  return {
    addReflection,
    handleDeleteEntry,
    handleRefresh,
    isDeleting,
    showDeleteAlert,
    setShowDeleteAlert,
    today
  };
};
