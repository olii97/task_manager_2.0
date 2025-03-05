
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WeightEntry, BodyFeeling } from '@/types/weight';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export type TimeRange = '7days' | '14days' | '30days' | 'all';

export const useWeightEntries = (userId: string | undefined) => {
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [feelingModalOpen, setFeelingModalOpen] = useState(false);
  const [pendingEntryId, setPendingEntryId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  
  const queryClient = useQueryClient();

  // Fetch weight entries
  const { data: entries = [], isLoading: isEntriesLoading } = useQuery({
    queryKey: ['weightEntries', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching weight entries:', error);
        return [];
      }
      
      return data as WeightEntry[];
    },
    enabled: !!userId,
  });

  // Get latest entry and format it for the UI
  const latestEntry = entries.length > 0 
    ? {
        weight: entries[0].weight,
        timeAgo: formatDistanceToNow(new Date(entries[0].created_at), { addSuffix: true }),
        feeling: entries[0].body_feeling as BodyFeeling | null
      }
    : null;
  const isLatestLoading = isEntriesLoading;

  // Calculate changes
  const calculateChanges = () => {
    if (entries.length < 2) return null;
    
    const sortedEntries = [...entries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    const lastEntry = sortedEntries[sortedEntries.length - 1];
    
    // Weekly change
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekEntryIndex = sortedEntries.findIndex(entry => new Date(entry.created_at) >= weekAgo);
    const weeklyChange = weekEntryIndex !== -1 
      ? lastEntry.weight - sortedEntries[weekEntryIndex].weight
      : null;
    
    // Monthly change
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    const monthEntryIndex = sortedEntries.findIndex(entry => new Date(entry.created_at) >= monthAgo);
    const monthlyChange = monthEntryIndex !== -1 
      ? lastEntry.weight - sortedEntries[monthEntryIndex].weight
      : null;
    
    return {
      weekly: weeklyChange,
      monthly: monthlyChange
    };
  };

  // Log weight mutation
  const logWeightMutation = useMutation({
    mutationFn: async (weightValue: number) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('weight_entries')
        .insert({
          user_id: userId,
          weight: weightValue
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['weightEntries', userId] });
      setPendingEntryId(data.id);
      setLogModalOpen(false);
      setFeelingModalOpen(true);
      toast.success('Weight logged successfully');
    },
    onError: (error) => {
      console.error('Error logging weight:', error);
      toast.error('Failed to log weight');
    }
  });

  // Record body feeling mutation
  const recordBodyFeelingMutation = useMutation({
    mutationFn: async ({ 
      feeling, 
      note 
    }: { 
      feeling: BodyFeeling; 
      note?: string 
    }) => {
      if (!pendingEntryId) throw new Error('No pending entry');
      
      const { data, error } = await supabase
        .from('weight_entries')
        .update({
          body_feeling: feeling,
          feeling_note: note || null
        })
        .eq('id', pendingEntryId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightEntries', userId] });
      setPendingEntryId(null);
      setFeelingModalOpen(false);
      toast.success('Body feeling recorded');
    },
    onError: (error) => {
      console.error('Error recording body feeling:', error);
      toast.error('Failed to record body feeling');
    }
  });

  // Delete entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('weight_entries')
        .delete()
        .eq('id', entryId);
      
      if (error) throw error;
      return entryId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightEntries', userId] });
      toast.success('Entry deleted');
    },
    onError: (error) => {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  });

  // Exported functions
  const logWeight = (weightValue: number) => {
    logWeightMutation.mutate(weightValue);
  };

  const recordBodyFeeling = (feeling: BodyFeeling, note?: string) => {
    recordBodyFeelingMutation.mutate({ feeling, note });
  };

  const deleteEntry = (entryId: string) => {
    deleteEntryMutation.mutate(entryId);
  };

  return {
    entries,
    isEntriesLoading,
    logModalOpen,
    setLogModalOpen,
    feelingModalOpen,
    setFeelingModalOpen,
    timeRange,
    setTimeRange,
    changes: calculateChanges(),
    logWeight,
    recordBodyFeeling,
    deleteEntry,
    latestEntry,
    isLatestLoading
  };
};
