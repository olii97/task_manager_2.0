
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { SavedStravaActivity } from "@/types/strava";
import { getStravaActivities, saveActivityToDatabase } from "@/services/strava";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function Strava() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activities, setActivities] = useState<SavedStravaActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Strava activities
  const { 
    data: fetchedActivities, 
    isLoading: isActivitiesLoading, 
    refetch 
  } = useQuery({
    queryKey: ['stravaActivities', userId],
    queryFn: () => getStravaActivities(userId || ''),
    enabled: !!userId,
  });

  useEffect(() => {
    if (fetchedActivities) {
      setActivities(fetchedActivities);
    }
  }, [fetchedActivities]);

  // Save activity mutation
  const saveActivityMutation = useMutation({
    mutationFn: (activity: SavedStravaActivity) => saveActivityToDatabase(activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stravaActivities', userId] });
      toast({
        title: "Activity saved",
        description: "Strava activity has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving activity",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving activity:", error);
    }
  });

  const handleSaveActivity = (activity: SavedStravaActivity) => {
    saveActivityMutation.mutate(activity);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refetch();
      toast({
        title: "Refreshed",
        description: "Strava activities have been refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh Strava activities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Strava Activities</h1>
        <Button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            "Refresh Activities"
          )}
        </Button>
      </div>

      {isActivitiesLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : activities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardHeader>
                <CardTitle>{activity.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Type: {activity.type}</p>
                <p>Distance: {(activity.distance / 1000).toFixed(2)} km</p>
                <p>Date: {format(new Date(activity.start_date), "MMM dd, yyyy")}</p>
                <Button onClick={() => handleSaveActivity(activity)}>Save Activity</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <p className="text-center py-6 text-muted-foreground">No Strava activities found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
