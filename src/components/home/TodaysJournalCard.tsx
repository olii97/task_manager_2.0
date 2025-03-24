import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PenLine, Plus, Check, X } from "lucide-react";
import { JournalEntry, ReflectionEntry } from "@/types/journal";
import { getMoodEmoji } from "@/types/journal";
import { formatDistanceToNow, parseISO, format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { DashboardCard } from "@/components/ui/dashboard-card";

interface TodaysJournalCardProps {
  entry: JournalEntry | null;
  isLoading: boolean;
  refreshTodayEntry?: () => void;
}

export const TodaysJournalCard = ({ entry, isLoading, refreshTodayEntry }: TodaysJournalCardProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
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

  const handleEditClick = () => {
    if (latestReflection) {
      setReflectionText(latestReflection.content);
    } else {
      setReflectionText("");
    }
    setIsEditing(true);
  };

  const handleSaveReflection = async () => {
    if (!entry || !reflectionText.trim()) return;

    setIsSaving(true);
    try {
      // Create a new reflection entry
      const newReflection: ReflectionEntry = {
        timestamp: new Date().toISOString(),
        content: reflectionText.trim()
      };

      // Combine with existing reflections or create new array
      const updatedReflections = entry.reflections ? 
        [...entry.reflections, newReflection] : 
        [newReflection];

      // Update the entry in the database
      const { error } = await supabase
        .from('journal_entries')
        .update({ 
          reflections: updatedReflections,
          updated_at: new Date().toISOString()
        })
        .eq('id', entry.id);

      if (error) {
        console.error('Error updating reflection:', error);
        toast({
          title: "Error",
          description: "Failed to update your reflection",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Reflection updated",
          description: "Your journal has been updated"
        });
        
        // Refresh the entry data if a refresh function was provided
        if (refreshTodayEntry) {
          refreshTodayEntry();
        }
      }
    } catch (error) {
      console.error('Unexpected error saving reflection:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const titleRightContent = entry ? (
    <span className="text-xs text-muted-foreground">
      {formatDistanceToNow(parseISO(entry.updated_at), { addSuffix: true })}
    </span>
  ) : null;
  
  return (
    <DashboardCard id="todays-journal" title="Today's Journal" titleRightContent={titleRightContent}>
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
          
          {isEditing ? (
            <div className="mt-2 mb-3">
              <Textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Update your reflection..."
                className="min-h-[100px] mb-2"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleSaveReflection}
                  disabled={isSaving}
                >
                  <Check className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {latestReflection ? (
                <div className="mt-2 mb-3">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(latestReflection.timestamp), "h:mm a")}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 px-2 text-xs" 
                      onClick={handleEditClick}
                    >
                      <PenLine className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>
                  <p className="text-sm line-clamp-4 whitespace-pre-wrap mt-1">
                    {latestReflection.content}
                  </p>
                </div>
              ) : (
                <div className="mt-2 mb-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEditClick}
                  >
                    <PenLine className="h-4 w-4 mr-1" /> Add Reflection
                  </Button>
                </div>
              )}
            </>
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
    </DashboardCard>
  );
};
