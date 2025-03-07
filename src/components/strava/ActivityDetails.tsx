
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StravaActivity, SavedStravaActivity } from '@/types/strava';
import { saveStravaActivity } from '@/services/strava';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { SaveIcon, ExternalLinkIcon, XIcon } from 'lucide-react';

interface ActivityDetailsProps {
  activity: StravaActivity | SavedStravaActivity;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityDetails: React.FC<ActivityDetailsProps> = ({ activity, isOpen, onClose }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState('saved' in activity ? activity.saved : false);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP p');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else {
      return `${minutes}m ${secs}s`;
    }
  };

  const formatDistance = (meters: number) => {
    const kilometers = meters / 1000;
    return `${kilometers.toFixed(2)} km`;
  };

  const handleSave = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save activities",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveStravaActivity(session.user.id, activity);
      if (result.success) {
        setIsSaved(true);
        toast({
          title: "Activity saved",
          description: "The activity has been saved to your profile",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save activity",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error saving activity:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{activity.name}</DialogTitle>
          <DialogDescription>
            {activity.type} • {formatDate(activity.start_date_local)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Details</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Distance</span>
                <span className="font-medium">{formatDistance(activity.distance)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{formatDuration(activity.moving_time)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Elevation</span>
                <span className="font-medium">{activity.total_elevation_gain} m</span>
              </li>
              {activity.average_speed && (
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Average Speed</span>
                  <span className="font-medium">{(activity.average_speed * 3.6).toFixed(1)} km/h</span>
                </li>
              )}
              {activity.max_speed && (
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Max Speed</span>
                  <span className="font-medium">{(activity.max_speed * 3.6).toFixed(1)} km/h</span>
                </li>
              )}
              {activity.average_heartrate && (
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Average Heart Rate</span>
                  <span className="font-medium">{activity.average_heartrate} bpm</span>
                </li>
              )}
              {activity.max_heartrate && (
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Max Heart Rate</span>
                  <span className="font-medium">{activity.max_heartrate} bpm</span>
                </li>
              )}
              {activity.achievement_count !== undefined && (
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Achievements</span>
                  <span className="font-medium">{activity.achievement_count}</span>
                </li>
              )}
              {activity.kudos_count !== undefined && (
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Kudos</span>
                  <span className="font-medium">{activity.kudos_count}</span>
                </li>
              )}
            </ul>
          </div>
          
          <div>
            {activity.map?.summary_polyline && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Route</h3>
                <img 
                  src={`https://maps.googleapis.com/maps/api/staticmap?size=400x400&path=enc:${activity.map.summary_polyline}&key=YOUR_API_KEY`} 
                  alt="Activity route" 
                  className="w-full h-48 object-cover rounded-md bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Static map preview (Google Maps API key required for actual map)
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            <XIcon className="mr-2 h-4 w-4" />
            Close
          </Button>
          <div className="flex gap-2">
            {'saved' in activity && activity.saved || isSaved ? (
              <Button variant="secondary" disabled>
                <SaveIcon className="mr-2 h-4 w-4" />
                Saved
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={isSaving}>
                <SaveIcon className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Activity'}
              </Button>
            )}
            <Button variant="outline" asChild>
              <a href={`https://www.strava.com/activities/${activity.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="mr-2 h-4 w-4" />
                View on Strava
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
