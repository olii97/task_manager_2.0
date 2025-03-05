
import { formatDistanceToNow } from "date-fns";
import { JournalEntry, getMoodEmoji } from "@/types/journal";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface JournalEntryListProps {
  entries: JournalEntry[];
  isLoading: boolean;
  selectedEntryId?: string;
  onSelectEntry: (entry: JournalEntry) => void;
  searchTerm?: string;
  dateFilter?: Date;
}

export function JournalEntryList({
  entries,
  isLoading,
  selectedEntryId,
  onSelectEntry,
  searchTerm,
  dateFilter
}: JournalEntryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            {searchTerm || dateFilter ? "No entries match your search" : "No journal entries yet"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
      {entries.map((entry) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card 
            className={cn(
              "overflow-hidden cursor-pointer transition-all hover:shadow-md",
              selectedEntryId === entry.id ? "ring-2 ring-primary" : ""
            )}
            onClick={() => onSelectEntry(entry)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <time className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                </time>
                <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
              </div>
              
              {entry.intentions && (
                <div className="mb-2">
                  <h4 className="font-medium text-sm">Intentions:</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">{entry.intentions}</p>
                </div>
              )}
              
              {entry.reflection && (
                <p className="text-sm text-muted-foreground line-clamp-2">{entry.reflection}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
