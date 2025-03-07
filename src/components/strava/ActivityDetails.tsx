import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { StravaActivity } from "@/types/strava";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { saveStravaActivity } from "@/services/strava";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ActivityDetailsProps {
  activity: StravaActivity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityDetails: React.FC<ActivityDetailsProps> = ({ activity, isOpen, onClose }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [savingActivity, setSavingActivity] = useState(false);
  const [currentActivity, setActivity] = useState<StravaActivity | null>(activity);

  useEffect(() => {
    setActivity(activity);
  }, [activity]);

  if (!activity) {
    return null;
  }

  const startDate = format(new Date(activity.start_date_local), 'PPP p');

  // Fix the saveActivity function to properly handle the return value
  const saveActivity = async () => {
    if (!session?.user || !activity) return;
    
    setSavingActivity(true);
    try {
      const result = await saveStravaActivity(session.user.id, activity);
      if (result) {
        toast({
          title: "Success",
          description: "Activity saved successfully",
        });
        
        // Update the saved status
        setActivity(prev => prev ? { ...prev, saved: true } : null);
      } else {
        toast({
          title: "Error",
          description: "Failed to save activity",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the activity",
        variant: "destructive",
      });
    } finally {
      setSavingActivity(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{activity.name}</DialogTitle>
          <DialogDescription>
            {startDate}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium leading-none">Type</p>
              <p className="text-sm text-muted-foreground">{activity.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Distance</p>
              <p className="text-sm text-muted-foreground">{(activity.distance / 1000).toFixed(2)} km</p>
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Moving Time</p>
              <p className="text-sm text-muted-foreground">{(activity.moving_time / 60).toFixed(0)} minutes</p>
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Average Speed</p>
              <p className="text-sm text-muted-foreground">{(activity.average_speed || 0).toFixed(2)} m/s</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          {!activity.saved ? (
            <Button type="button" onClick={saveActivity} disabled={savingActivity}>
              {savingActivity ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Activity"
              )}
            </Button>
          ) : (
            <Button type="button" variant="outline" disabled>
              Saved
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
