
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
  getStravaActivityDetails,
  saveActivityToDatabase,
  deleteActivityFromDatabase
} from "@/services/stravaService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { StravaActivity, SavedStravaActivity, toSavedStravaActivity } from "@/types/strava";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Strava = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activityId = searchParams.get('activityId');
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<SavedStravaActivity | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

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

  const saveActivityMutation = useMutation({
    mutationFn: async (activity: StravaActivity) => {
      if (!userId) throw new Error("User not authenticated");
      return await saveActivityToDatabase(userId, activity);
    },
    onSuccess: () => {
      toast.success("Activity saved to your account");
      queryClient.invalidateQueries({ queryKey: ["strava-activity-details", userId, activityId] });
      queryClient.invalidateQueries({ queryKey: ["strava-activities", userId] });
      setShowSaveDialog(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to save activity: ${error.message}`);
      setShowSaveDialog(false);
    }
  });

  const removeActivityMutation = useMutation({
    mutationFn: async (activityId: number) => {
      if (!userId) throw new Error("User not authenticated");
      return await deleteActivityFromDatabase(userId, activityId);
    },
    onSuccess: () => {
      toast.success("Activity removed from your account");
      queryClient.invalidateQueries({ queryKey: ["strava-activity-details", userId, activityId] });
      queryClient.invalidateQueries({ queryKey: ["strava-activities", userId] });
      setShowRemoveDialog(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to remove activity: ${error.message}`);
      setShowRemoveDialog(false);
    }
  });

  useEffect(() => {
    if (activityDetails) {
      setSelectedActivity(activityDetails);
    } else if (activityId && activities) {
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
    setSelectedActivity(toSavedStravaActivity(activity, activity['saved'] as boolean));
    setSearchParams({ activityId: activity.id.toString() });
  };

  const handleBackToList = () => {
    setSelectedActivity(null);
    setSearchParams({});
  };

  const handleSaveActivity = () => {
    if (selectedActivity) {
      setShowSaveDialog(true);
    }
  };

  const handleRemoveActivity = () => {
    if (selectedActivity) {
      setShowRemoveDialog(true);
    }
  };

  const confirmSaveActivity = () => {
    if (selectedActivity) {
      saveActivityMutation.mutate(selectedActivity);
    }
  };

  const confirmRemoveActivity = () => {
    if (selectedActivity) {
      removeActivityMutation.mutate(selectedActivity.id);
    }
  };

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
          <>
            <StravaActivityDetails 
              activity={selectedActivity} 
              onBack={handleBackToList}
              onSave={selectedActivity.saved ? handleRemoveActivity : handleSaveActivity}
              isSaved={selectedActivity.saved}
            />

            <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Save Activity</AlertDialogTitle>
                  <AlertDialogDescription>
                    Do you want to save this activity to your account? This will store a copy of this activity in your database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmSaveActivity}>Save</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Saved Activity</AlertDialogTitle>
                  <AlertDialogDescription>
                    Do you want to remove this activity from your saved activities? This will not delete the activity from Strava.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmRemoveActivity}>Remove</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    );
  }

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
