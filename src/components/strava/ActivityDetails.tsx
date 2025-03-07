
import React from 'react';
import { StravaActivity } from "@/types/strava";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StravaActivitySummary } from "./StravaActivitySummary";
import { StravaPerformanceMetrics } from "./StravaPerformanceMetrics";
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { saveStravaActivity } from "@/services/strava";
import { useAuth } from "@/components/AuthProvider";

interface ActivityDetailsProps {
  activity: StravaActivity;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityDetails: React.FC<ActivityDetailsProps> = ({ 
  activity, 
  isOpen, 
  onClose 
}) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveActivity = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save activities",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveStravaActivity(session.user.id, activity);
      toast({
        title: "Success",
        description: "Activity saved successfully"
      });
      onClose();
    } catch (error) {
      console.error("Failed to save activity:", error);
      toast({
        title: "Error",
        description: "Failed to save activity",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Format date safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    try {
      return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {activity.name || "Activity Details"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="my-4">
          <p className="text-sm text-muted-foreground">
            {formatDate(activity.start_date_local || activity.start_date)}
          </p>
          
          <div className="grid grid-cols-1 gap-6 mt-4">
            <StravaActivitySummary activity={activity} />
            
            {activity.average_heartrate && 
              <StravaPerformanceMetrics activity={activity} />
            }
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="sm:mr-auto"
          >
            Close
          </Button>
          
          {!activity.saved && (
            <Button 
              onClick={handleSaveActivity}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Activity"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
