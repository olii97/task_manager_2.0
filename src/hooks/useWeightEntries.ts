
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWeightEntries, getLatestWeightEntry, logWeight, deleteWeightEntry } from "@/services/weightService";
import { WeightEntry, TimeRange, BodyFeeling } from "@/types/weight";
import { useToast } from "@/hooks/use-toast";

export function useWeightEntries(userId: string | undefined) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [feelingModalOpen, setFeelingModalOpen] = useState(false);
  const [tempEntry, setTempEntry] = useState<{ weight: number } | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for all weight entries
  const { 
    data: entries = [], 
    isLoading: isEntriesLoading,
    refetch: refetchEntries 
  } = useQuery({
    queryKey: ['weightEntries', userId, timeRange],
    queryFn: () => getWeightEntries(userId || '', timeRange),
    enabled: !!userId,
  });

  // Query for latest weight entry
  const {
    data: latestEntry,
    isLoading: isLatestLoading,
    refetch: refetchLatest
  } = useQuery({
    queryKey: ['latestWeightEntry', userId],
    queryFn: () => getLatestWeightEntry(userId || ''),
    enabled: !!userId,
  });

  // Log weight mutation
  const logWeightMutation = useMutation({
    mutationFn: (data: { weight: number; bodyFeeling?: BodyFeeling; feelingNote?: string }) => 
      logWeight(userId || '', data.weight, data.bodyFeeling, data.feelingNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightEntries'] });
      queryClient.invalidateQueries({ queryKey: ['latestWeightEntry'] });
      setLogModalOpen(false);
      setFeelingModalOpen(false);
      setTempEntry(null);
      toast({
        title: "Weight logged successfully",
        description: "Your weight entry has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error logging weight",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error("Error logging weight:", error);
    }
  });

  // Delete weight entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: (entryId: string) => deleteWeightEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightEntries'] });
      queryClient.invalidateQueries({ queryKey: ['latestWeightEntry'] });
      toast({
        title: "Entry deleted",
        description: "Weight entry has been removed."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting entry",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting weight entry:", error);
    }
  });

  const handleLogWeight = (weight: number) => {
    setTempEntry({ weight });
    setLogModalOpen(false);
    setFeelingModalOpen(true);
  };

  const handleLogFeelingAndWeight = (bodyFeeling: BodyFeeling, feelingNote?: string) => {
    if (tempEntry) {
      logWeightMutation.mutate({
        weight: tempEntry.weight,
        bodyFeeling,
        feelingNote
      });
    }
  };

  const deleteEntry = (entryId: string) => {
    deleteEntryMutation.mutate(entryId);
  };

  const refreshData = () => {
    refetchEntries();
    refetchLatest();
  };

  return {
    entries,
    isEntriesLoading,
    latestEntry,
    isLatestLoading,
    logModalOpen,
    setLogModalOpen,
    feelingModalOpen,
    setFeelingModalOpen,
    timeRange,
    setTimeRange,
    handleLogWeight,
    handleLogFeelingAndWeight,
    refreshData,
    deleteEntry
  };
}
