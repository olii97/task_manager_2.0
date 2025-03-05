
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { JournalEntry, getMoodEmoji, getEnergyLabel } from "@/types/journal";
import { format, parseISO } from "date-fns";
import { JournalReflectionsSection } from "./JournalReflectionsSection";

interface JournalEntryDetailProps {
  entry: JournalEntry;
  onEdit: () => void;
  onDelete: () => void;
  showDeleteAlert: boolean;
  setShowDeleteAlert: (show: boolean) => void;
  isDeleting: boolean;
  newReflection: string;
  setNewReflection: (value: string) => void;
  addReflection: (entryId: string, content: string) => void;
}

export function JournalEntryDetail({
  entry,
  onEdit,
  onDelete,
  showDeleteAlert,
  setShowDeleteAlert,
  isDeleting,
  newReflection,
  setNewReflection,
  addReflection
}: JournalEntryDetailProps) {
  const formattedDate = format(parseISO(entry.date), "PPPP");
  
  const handleAddReflection = (content: string) => {
    addReflection(entry.id, content);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>{formattedDate}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowDeleteAlert(true)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:gap-8">
            <div className="flex gap-4 items-center mb-4 md:mb-0">
              <div className="text-center">
                <div className="text-4xl mb-1">{getMoodEmoji(entry.mood)}</div>
                <div className="text-xs text-muted-foreground">Mood</div>
                <div className="text-sm font-medium">{entry.mood}/5</div>
              </div>
              
              <div className="text-center">
                <div className="h-10 flex items-center justify-center mb-1">
                  <span className="text-lg font-semibold">
                    {getEnergyLabel(entry.energy)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">Energy</div>
                <div className="text-sm font-medium">{entry.energy}/5</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Reflections</h3>
              <JournalReflectionsSection
                reflections={entry.reflections || []}
                onAddReflection={handleAddReflection}
                newReflection={newReflection}
                setNewReflection={setNewReflection}
              />
            </div>

            {entry.gratitude && (
              <div>
                <h3 className="text-sm font-medium mb-2">Gratitude</h3>
                <p className="text-sm whitespace-pre-wrap p-3 bg-muted/50 rounded-md">
                  {entry.gratitude}
                </p>
              </div>
            )}

            {entry.challenges && (
              <div>
                <h3 className="text-sm font-medium mb-2">Challenges</h3>
                <p className="text-sm whitespace-pre-wrap p-3 bg-muted/50 rounded-md">
                  {entry.challenges}
                </p>
              </div>
            )}

            {entry.intentions && (
              <div>
                <h3 className="text-sm font-medium mb-2">Intentions</h3>
                <p className="text-sm whitespace-pre-wrap p-3 bg-muted/50 rounded-md">
                  {entry.intentions}
                </p>
              </div>
            )}

            {entry.nutrition && (
              <div>
                <h3 className="text-sm font-medium mb-2">Nutrition</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {entry.nutrition.breakfast && (
                    <div>
                      <p className="text-xs text-muted-foreground">Breakfast</p>
                      <p className="text-sm">{entry.nutrition.breakfast}</p>
                    </div>
                  )}
                  {entry.nutrition.lunch && (
                    <div>
                      <p className="text-xs text-muted-foreground">Lunch</p>
                      <p className="text-sm">{entry.nutrition.lunch}</p>
                    </div>
                  )}
                  {entry.nutrition.dinner && (
                    <div>
                      <p className="text-xs text-muted-foreground">Dinner</p>
                      <p className="text-sm">{entry.nutrition.dinner}</p>
                    </div>
                  )}
                  {entry.nutrition.snacks && (
                    <div>
                      <p className="text-xs text-muted-foreground">Snacks</p>
                      <p className="text-sm">{entry.nutrition.snacks}</p>
                    </div>
                  )}
                  {entry.nutrition.water !== undefined && (
                    <div>
                      <p className="text-xs text-muted-foreground">Water (glasses)</p>
                      <p className="text-sm">{entry.nutrition.water}</p>
                    </div>
                  )}
                  {entry.nutrition.feelings && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">How I felt about my eating</p>
                      <p className="text-sm">{entry.nutrition.feelings}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Created {format(parseISO(entry.created_at), "PPp")}
          {entry.updated_at !== entry.created_at && 
            ` • Updated ${format(parseISO(entry.updated_at), "PPp")}`}
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your journal entry
              for {formattedDate}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
