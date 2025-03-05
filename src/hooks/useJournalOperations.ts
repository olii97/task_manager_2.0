
import { useJournalEntries } from "./journal/useJournalEntries";
import { useTodayJournal } from "./journal/useTodayJournal";
import { useJournalStreaks } from "./journal/useJournalStreaks";
import { useJournalActions } from "./journal/useJournalActions";
import { useJournalState } from "./journal/useJournalState";

// Main hook that composes all journal functionality
export const useJournalOperations = (userId: string | undefined) => {
  // Get journal state (UI state management)
  const {
    searchTerm,
    dateRange,
    selectedEntry,
    isEditing,
    isCreatingNew,
    newReflection,
    setNewReflection,
    setSearchTerm,
    setDateRange,
    setSelectedEntry,
    setIsEditing,
    setIsCreatingNew,
    handleEditEntry,
    handleNewEntry,
    handleCancelEdit,
    handleSearchChange,
    handleDateSelect,
    handleSelectEntry
  } = useJournalState();

  // Get journal entries with search/filter functionality
  const { 
    data: allEntries, 
    isLoading: isEntriesLoading,
    refetch: refetchAll 
  } = useJournalEntries(userId, searchTerm, dateRange);

  // Get today's journal entry
  const { 
    data: todayEntry,
    isLoading: isTodayLoading,
    refetch: refetchToday
  } = useTodayJournal(userId);

  // Get streak data
  const { data: streakData } = useJournalStreaks(userId);

  // Get journal actions
  const {
    addReflection,
    handleDeleteEntry,
    handleRefresh,
    isDeleting,
    showDeleteAlert,
    setShowDeleteAlert,
    today
  } = useJournalActions(userId);

  // Action for confirming deletion
  const confirmDeleteEntry = () => {
    setShowDeleteAlert(true);
  };

  // Wrapper for delete entry to use the selected entry
  const deleteSelectedEntry = () => {
    handleDeleteEntry(selectedEntry);
    setSelectedEntry(null);
  };

  return {
    // Data
    today,
    allEntries,
    streakData,
    
    // UI State
    searchTerm,
    dateRange,
    selectedEntry,
    showDeleteAlert,
    isEditing,
    isCreatingNew,
    isDeleting,
    isTodayLoading,
    isEntriesLoading,
    newReflection,
    
    // State setters
    setNewReflection,
    setShowDeleteAlert,
    
    // Actions
    addReflection,
    handleRefresh,
    handleEditEntry,
    handleNewEntry,
    handleCancelEdit,
    handleSearchChange,
    handleDateSelect,
    handleSelectEntry,
    confirmDeleteEntry,
    handleDeleteEntry: deleteSelectedEntry
  };
};
