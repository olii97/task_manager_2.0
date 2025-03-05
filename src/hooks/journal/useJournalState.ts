
import { useState } from "react";
import { JournalEntry } from "@/types/journal";

// Hook for managing journal UI state
export const useJournalState = () => {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);
  
  // UI state
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newReflection, setNewReflection] = useState("");
  
  // UI handlers
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

  return {
    // State
    searchTerm,
    dateRange,
    selectedEntry,
    isEditing,
    isCreatingNew,
    newReflection,
    setNewReflection,
    
    // Actions
    setSearchTerm,
    setDateRange,
    setSelectedEntry,
    setIsEditing,
    setIsCreatingNew,
    
    // Handlers
    handleEditEntry,
    handleNewEntry,
    handleCancelEdit,
    handleSearchChange,
    handleDateSelect,
    handleSelectEntry
  };
};
