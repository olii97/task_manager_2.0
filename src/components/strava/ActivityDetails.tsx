import React, { useState, useEffect } from 'react';
import { StravaActivity, SavedStravaActivity, toSavedStravaActivity, ActivityZones } from "@/types/strava";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { saveStravaActivity } from "@/services/strava";
import { getActivityZones } from "@/services/strava/activityService";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Calendar, Clock, Navigation2 } from "lucide-react";
import { StravaRouteMap } from './StravaRouteMap';
import { StravaPerformanceMetrics } from './StravaPerformanceMetrics';
import { StravaSplitDetails } from './StravaSplitDetails';
import { StravaLapDetails } from './StravaLapDetails';
import { StravaSegments } from './StravaSegments';
import { StravaHeartRate } from './StravaHeartRate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ActivityDetailsProps {
  activity: StravaActivity | SavedStravaActivity | null;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to ensure activity has saved property
const ensureSavedProperty = (activity: StravaActivity | SavedStravaActivity): SavedStravaActivity => {
  if ('saved' in activity && typeof activity.saved === 'boolean') {
    return activity as SavedStravaActivity;
  }
  return {
    ...activity,
    saved: false,
  };
};

export const ActivityDetails: React.FC<ActivityDetailsProps> = ({ activity }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [savingActivity, setSavingActivity] = useState(false);
  const [zones, setZones] = useState<ActivityZones | null>(null);
  const [loadingZones, setLoadingZones] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      if (!activity || !session?.user) return;
      
      setLoadingZones(true);
      try {
        const zonesData = await getActivityZones(session.user.id, activity.id);
        setZones(zonesData);
      } catch (error) {
        console.error('Error fetching zones:', error);
      } finally {
        setLoadingZones(false);
      }
    };

    fetchZones();
  }, [activity, session]);

  if (!activity) return null;

  const startDate = format(new Date(activity.start_date_local), 'PPP p');
  const activityWithSaved = ensureSavedProperty(activity);

  const saveActivity = async () => {
    if (!session?.user || !activity) return;
    
    setSavingActivity(true);
    try {
      const savedActivity = toSavedStravaActivity(activity, false);
      const result = await saveStravaActivity(session.user.id, savedActivity);
      
      if (result) {
        toast({
          title: "Success",
          description: "Activity saved successfully",
        });
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
    <div className="h-full flex flex-col">
      <div className="flex-none">
        <h2 className="text-2xl font-bold mb-2">{activity.name}</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 opacity-70" />
            <span className="text-sm">{startDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 opacity-70" />
            <span className="text-sm">{(activity.moving_time / 60).toFixed(0)} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Navigation2 className="h-4 w-4 opacity-70" />
            <span className="text-sm">{(activity.distance / 1000).toFixed(2)} km</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="map" className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="heart-rate">Heart Rate</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="splits">Splits</TabsTrigger>
          <TabsTrigger value="laps">Laps</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
        </TabsList>
        <div className="flex-1 mt-4">
          <TabsContent value="map" className="h-full">
            <StravaRouteMap activity={activityWithSaved} />
          </TabsContent>
          <TabsContent value="heart-rate">
            {loadingZones ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <StravaHeartRate 
                activity={activityWithSaved} 
                zones={zones?.heart_rate?.zones} 
              />
            )}
          </TabsContent>
          <TabsContent value="performance">
            <StravaPerformanceMetrics activity={activityWithSaved} />
          </TabsContent>
          <TabsContent value="splits">
            <StravaSplitDetails activity={activityWithSaved} />
          </TabsContent>
          <TabsContent value="laps">
            <StravaLapDetails activity={activityWithSaved} />
          </TabsContent>
          <TabsContent value="segments">
            <StravaSegments activity={activityWithSaved} />
          </TabsContent>
        </div>
      </Tabs>

      <div className="flex-none mt-4">
        {!activityWithSaved.saved && (
          <Button onClick={saveActivity} disabled={savingActivity} className="w-full">
            {savingActivity ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Activity"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
