
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchWeightEntries, 
  fetchLatestWeightEntry, 
  addWeightEntry, 
  updateBodyFeeling,
  deleteWeightEntry
} from "@/services/weightService";
import { WeightEntry, BodyFeeling } from "@/types/weight";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow, parseISO } from "date-fns";

export const useWeightEntries = (userId: string | undefined) => {
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [feelingModalOpen, setFeelingModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<WeightEntry | null>(null);
  const [timeRange, setTimeRange] = useState<"7days" | "14days" | "30days">("7days");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all weight entries
  const { data: entries = [], isLoading: isEntriesLoading } = useQuery({
    queryKey: ["weight-entries", userId],
    queryFn: () => fetchWeightEntries(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch latest weight entry
  const { data: latestEntry, isLoading: isLatestLoading } = useQuery({
    queryKey: ["latest-weight-entry", userId],
    queryFn: () => fetchLatestWeightEntry(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Format the latest entry for display
  const formattedLatestEntry = latestEntry ? {
    weight: latestEntry.weight,
    timeAgo: formatDistanceToNow(parseISO(latestEntry.created_at), { addSuffix: true }),
    feeling: latestEntry.body_feeling as BodyFeeling | null
  } : null;

  // Calculate weight changes
  const calculateChanges = () => {
    if (entries.length < 2) return null;
    
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    const lastMonth = sortedEntries.slice(-30);
    const lastWeek = sortedEntries.slice(-7);
    
    const monthlyChange = lastMonth.length >= 2 
      ? lastMonth[lastMonth.length - 1].weight - lastMonth[0].weight 
      : null;
    
    const weeklyChange = lastWeek.length >= 2 
      ? lastWeek[lastWeek.length - 1].weight - lastWeek[0].weight 
      : null;
    
    return {
      weekly: weeklyChange,
      monthly: monthlyChange
    };
  };

  // Add new weight entry
  const addEntryMutation = useMutation({
    mutationFn: (weight: number) => addWeightEntry(userId!, weight),
    onSuccess: (newEntry) => {
      queryClient.invalidateQueries({ queryKey: ["weight-entries"] });
      queryClient.invalidateQueries({ queryKey: ["latest-weight-entry"] });
      setCurrentEntry(newEntry);
      setLogModalOpen(false);
      setFeelingModalOpen(true);
      toast({
        title: "Weight logged successfully",
        description: `${weight} kg has been recorded.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to log weight",
        description: "There was an error recording your weight.",
        variant: "destructive",
      });
      console.error("Error adding weight entry:", error);
    },
  });

  // Update body feeling
  const updateFeelingMutation = useMutation({
    mutationFn: ({ 
      entryId, 
      feeling, 
      note 
    }: { 
      entryId: string; 
      feeling: string; 
      note?: string 
    }) => updateBodyFeeling(entryId, feeling, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weight-entries"] });
      queryClient.invalidateQueries({ queryKey: ["latest-weight-entry"] });
      setFeelingModalOpen(false);
      toast({
        title: "Body check-in recorded",
        description: "Your body feeling has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to record body check-in",
        description: "There was an error saving your body feeling.",
        variant: "destructive",
      });
      console.error("Error updating body feeling:", error);
    },
  });

  // Delete weight entry
  const deleteEntryMutation = useMutation({
    mutationFn: (entryId: string) => deleteWeightEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weight-entries"] });
      queryClient.invalidateQueries({ queryKey: ["latest-weight-entry"] });
      toast({
        title: "Weight entry deleted",
        description: "The weight entry has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete entry",
        description: "There was an error deleting the weight entry.",
        variant: "destructive",
      });
      console.error("Error deleting weight entry:", error);
    },
  });

  const logWeight = (weight: number) => {
    addEntryMutation.mutate(weight);
  };

  const recordBodyFeeling = (feeling: BodyFeeling, note?: string) => {
    if (currentEntry) {
      updateFeelingMutation.mutate({
        entryId: currentEntry.id,
        feeling,
        note
      });
    }
  };

  const deleteEntry = (entryId: string) => {
    deleteEntryMutation.mutate(entryId);
  };

  return {
    entries,
    latestEntry: formattedLatestEntry,
    isEntriesLoading,
    isLatestLoading,
    logModalOpen,
    setLogModalOpen,
    feelingModalOpen,
    setFeelingModalOpen,
    currentEntry,
    timeRange,
    setTimeRange,
    changes: calculateChanges(),
    logWeight,
    recordBodyFeeling,
    deleteEntry,
  };
};
