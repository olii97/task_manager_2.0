
import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StravaConnectForm } from "@/components/StravaConnectForm";
import { StravaErrorDisplay } from "@/components/StravaErrorDisplay";
import { StravaActivityList } from "@/components/StravaActivityList";
import { StravaActivity, SavedStravaActivity } from "@/types/strava";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// Update the import path to use the new structure
import { saveActivityToDatabase } from "@/services/strava";
import useStravaActivities from "@/hooks/useStravaActivities";

interface StravaActivitiesProps {
  activities?: StravaActivity[];
}

const StravaActivities: React.FC<StravaActivitiesProps> = ({ activities: propActivities }) => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isStravaConnected, setIsStravaConnected] = useState(false);
  const [stravaError, setStravaError] = useState<string | null>(null);

  const { 
    activities, 
    isLoading, 
    isConnected: hookIsConnected,
    isConnectionLoading
  } = useStravaActivities();

  useEffect(() => {
    setIsStravaConnected(hookIsConnected);
  }, [hookIsConnected]);

  const { mutate: saveActivity } = useMutation({
    mutationFn: (activity: StravaActivity) => saveActivityToDatabase(activity),
    onSuccess: () => {
      toast({
        title: "Activity Saved",
        description: "This activity has been saved to your profile.",
      });
      queryClient.invalidateQueries({ queryKey: ['stravaActivities', userId] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Failed to save activity. Please try again.",
      });
    },
  });

  const handleSaveActivity = (activity: StravaActivity) => {
    saveActivity(activity);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['stravaActivities', userId] });
  };

  if (!userId) {
    return <p>Please log in to connect to Strava.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strava Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activities" className="w-full">
          <TabsList>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="connect">Connect</TabsTrigger>
          </TabsList>
          <TabsContent value="activities">
            {stravaError && <StravaErrorDisplay error={stravaError} />}
            {isLoading ? (
              <p>Loading activities...</p>
            ) : (
              <StravaActivityList
                activities={activities || []}
                onSave={handleSaveActivity}
                isLoading={false}
                onRefresh={handleRefresh}
              />
            )}
          </TabsContent>
          <TabsContent value="connect">
            <StravaConnectForm
              isConnected={isStravaConnected}
              setIsConnected={setIsStravaConnected}
              setStravaError={setStravaError}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StravaActivities;
