
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PenLine, Plus } from "lucide-react";
import { JournalEntry } from "@/types/journal";
import { getMoodEmoji } from "@/types/journal";
import { formatDistanceToNow, parseISO, format } from "date-fns";

interface TodaysJournalCardProps {
  entry: JournalEntry | null;
  isLoading: boolean;
}

export const TodaysJournalCard = ({ entry, isLoading }: TodaysJournalCardProps) => {
  // Get the latest reflection content
  const getLatestReflection = () => {
    if (!entry) return null;
    
    if (entry.reflections && entry.reflections.length > 0) {
      // Sort reflections by timestamp (newest first) and get the first one
      return [...entry.reflections]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    }
    
    // Fallback to legacy reflection
    if (entry.reflection) {
      return {
        timestamp: entry.updated_at,
        content: entry.reflection
      };
    }
    
    return null;
  };
  
  const latestReflection = getLatestReflection();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Today's Journal</CardTitle>
        {entry && (
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(parseISO(entry.updated_at), { addSuffix: true })}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 bg-muted animate-pulse rounded-md"></div>
        ) : entry ? (
          <div>
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{entry.mood ? getMoodEmoji(entry.mood) : "😐"}</span>
              <p className="text-sm text-muted-foreground">
                Mood: {entry.mood}/5 • Energy: {entry.energy}/5
              </p>
            </div>
            
            {latestReflection && (
              <div className="mt-2 mb-3">
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(latestReflection.timestamp), "h:mm a")}
                </p>
                <p className="text-sm line-clamp-4 whitespace-pre-wrap mt-1">
                  {latestReflection.content}
                </p>
              </div>
            )}
            
            {/* Show gratitude if available */}
            {entry.gratitude && (
              <p className="text-sm line-clamp-2 mt-2 mb-3">
                <span className="font-medium">Grateful for:</span> {entry.gratitude}
              </p>
            )}
            
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/journal">
                  <PenLine className="h-4 w-4 mr-1" /> View Full Entry
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-muted-foreground">You haven't journaled today yet.</p>
            <Button asChild>
              <Link to="/journal">
                <Plus className="h-4 w-4 mr-1" /> Add Journal Entry
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
