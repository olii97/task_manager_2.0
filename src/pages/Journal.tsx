
import { useEffect } from "react";
import { JournalEntryForm } from "@/components/JournalEntryForm";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { JournalEntryList } from "@/components/journal/JournalEntryList";
import { JournalEntryDetail } from "@/components/journal/JournalEntryDetail";
import { JournalStreakCards } from "@/components/journal/JournalStreakCards";
import { JournalHeader } from "@/components/journal/JournalHeader";
import { JournalSearchBar } from "@/components/journal/JournalSearchBar";
import { useJournalOperations } from "@/hooks/useJournalOperations";
import { format } from "date-fns";
import { PenLine, Trash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const Journal = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  
  const {
    today,
    searchTerm,
    dateRange,
    selectedEntry,
    showDeleteAlert,
    setShowDeleteAlert,
    isEditing,
    isCreatingNew,
    isEntriesLoading,
    allEntries,
    streakData,
    handleRefresh,
    handleEditEntry,
    handleNewEntry,
    handleCancelEdit,
    handleSearchChange,
    handleDateSelect,
    handleSelectEntry,
    confirmDeleteEntry,
    handleDeleteEntry
  } = useJournalOperations(userId);

  useEffect(() => {
    document.title = "Journal | Daily Driver";
  }, []);

  return (
    <div className="container py-6">
      <JournalHeader onNewEntry={handleNewEntry} onRefresh={handleRefresh} />

      {streakData && <JournalStreakCards streakData={streakData} />}

      <JournalSearchBar 
        searchTerm={searchTerm}
        dateRange={dateRange}
        onSearchChange={handleSearchChange}
        onDateSelect={handleDateSelect}
      />

      {isCreatingNew ? (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
          <JournalEntryForm onCancel={handleCancelEdit} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <JournalEntryList 
              entries={allEntries || []}
              isLoading={isEntriesLoading}
              selectedEntryId={selectedEntry?.id}
              onSelectEntry={handleSelectEntry}
              searchTerm={searchTerm}
              dateFilter={dateRange}
            />
          </div>
          
          <div className="lg:col-span-2">
            {!isEditing ? (
              selectedEntry ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Journal Entry for {format(new Date(selectedEntry.date), "MMMM d, yyyy")}
                      </h2>
                      {selectedEntry.date === today && <span className="text-sm text-muted-foreground">Today</span>}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditEntry(selectedEntry)}
                        className="flex items-center gap-1"
                      >
                        <PenLine className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={confirmDeleteEntry} 
                        className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <JournalEntryDetail entry={selectedEntry} />
                </div>
              ) : (
                <Card className="h-full flex items-center justify-center p-8">
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">
                      {isEntriesLoading ? "Loading entries..." :
                        allEntries && allEntries.length > 0 ? 
                          "Select a journal entry to view details" : 
                          "No journal entries found"}
                    </p>
                    {(!allEntries || allEntries.length === 0) && !isEntriesLoading && (
                      <Button onClick={handleNewEntry}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Entry
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            ) : (
              <div className="animate-fade-in">
                <JournalEntryForm
                  existingEntry={selectedEntry || undefined}
                  onCancel={handleCancelEdit}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this journal entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntry} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Journal;
