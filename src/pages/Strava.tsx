import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { StravaConnectForm } from "@/components/StravaConnectForm";
import { StravaActivityList } from "@/components/StravaActivityList";
import { StravaActivityDetails } from "@/components/StravaActivityDetails";
import { StravaErrorDisplay } from "@/components/StravaErrorDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  isConnectedToStrava, 
  getStravaActivities, 
  disconnectFromStrava, 
  connectToStrava,
  getStravaActivityDetails
} from "@/services/stravaService";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { StravaActivity } from "@/types/strava";

const Strava = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [searchParams, setSearchParams] = useSearchParams();
  const activityId = searchParams.get('activityId');
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null);

  useEffect(() => {
    document.title = "Strava | Daily Driver";
  }, []);

  const { data: isConnected, isLoading: isLoadingConnection } = useQuery({
    queryKey: ["strava-connected", userId],
    queryFn: () => isConnectedToStrava(userId!),
    enabled: !!userId,
  });

  const { 
    data: activities, 
    isLoading: isLoadingActivities,
    refetch: refetchActivities
  } = useQuery({
    queryKey: ["strava-activities", userId],
    queryFn: async () => {
      try {
        return await getStravaActivities(userId!);
      } catch (err: any) {
        setError(err.message || "Failed to load Strava activities");
        throw err;
      }
    },
    enabled: !!userId && !!isConnected,
  });

  const { 
    data: activityDetails,
    isLoading: isLoadingDetails
  } = useQuery({
    queryKey: ["strava-activity-details", userId, activityId],
    queryFn: async () => {
      if (!userId || !activityId) return null;
      const { activity, error } = await getStravaActivityDetails(userId, Number(activityId));
      if (error) {
        toast.error(`Failed to load activity details: ${error}`);
        return null;
      }
      return activity;
    },
    enabled: !!userId && !!activityId && !!isConnected,
  });

  useEffect(() => {
    if (activityDetails) {
      setSelectedActivity(activityDetails);
    } else if (activityId && activities) {
      // If we have an activityId but no details yet, try to find it in the activities list
      const found = activities.find(a => a.id === Number(activityId));
      if (found) {
        setSelectedActivity(found);
      }
    }
  }, [activityId, activityDetails, activities]);

  const handleConnectStrava = async () => {
    if (!session) return;
    
    setIsConnecting(true);
    try {
      const { url, error } = await connectToStrava(session.access_token);
      
      if (error) {
        setError(error);
        return;
      }
      
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to Strava");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!userId) return;
    
    try {
      const { success, error } = await disconnectFromStrava(userId);
      
      if (error) {
        toast.error(`Failed to disconnect: ${error}`);
        return;
      }
      
      if (success) {
        toast.success("Successfully disconnected from Strava");
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to disconnect from Strava");
    }
  };

  const handleRefresh = () => {
    refetchActivities();
    setError(null);
  };

  const handleSelectActivity = (activity: StravaActivity) => {
    setSelectedActivity(activity);
    setSearchParams({ activityId: activity.id.toString() });
  };

  const handleBackToList = () => {
    setSelectedActivity(null);
    setSearchParams({});
  };

  // If we have a selected activity, show its details
  if (selectedActivity) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Activity Details</h1>
        </div>
        
        {isLoadingDetails ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="h-24 mt-6 animate-pulse bg-gray-200 rounded-md"></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <StravaActivityDetails activity={selectedActivity} />
        )}
      </div>
    );
  }

  // Otherwise show the activities list
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Strava Integration</h1>
        <p className="text-muted-foreground">
          Connect with Strava to track your activities and fitness progress.
        </p>
      </div>

      {error && (
        <StravaErrorDisplay 
          error={error} 
          onRetry={handleRefresh} 
          onDisconnect={handleDisconnect} 
          isLoading={isLoadingActivities} 
        />
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingConnection ? (
                <div className="h-12 bg-muted animate-pulse rounded-md"></div>
              ) : (
                <StravaConnectForm 
                  isConnected={!!isConnected} 
                  isConnecting={isConnecting}
                  onConnect={handleConnectStrava}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {!isConnected && !isLoadingConnection ? (
                <p className="text-muted-foreground">
                  Connect your Strava account to see your activities here.
                </p>
              ) : (
                <StravaActivityList 
                  activities={activities || []} 
                  isLoading={isLoadingActivities}
                  onRefresh={handleRefresh}
                  onDisconnect={handleDisconnect}
                  onSelectActivity={handleSelectActivity}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Strava;
