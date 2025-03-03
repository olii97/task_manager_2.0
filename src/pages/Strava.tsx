
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { StravaConnectForm } from "@/components/StravaConnectForm";
import { StravaActivityList } from "@/components/StravaActivityList";
import { StravaErrorDisplay } from "@/components/StravaErrorDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isConnectedToStrava, getStravaActivities } from "@/services/stravaService";
import { useQuery } from "@tanstack/react-query";

const Strava = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [error, setError] = useState<string | null>(null);

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
    error: activitiesError,
    refetch: refetchActivities
  } = useQuery({
    queryKey: ["strava-activities", userId],
    queryFn: () => getStravaActivities(userId!),
    enabled: !!userId && !!isConnected,
    onError: (err: any) => {
      setError(err.message || "Failed to load Strava activities");
    },
  });

  const handleConnectionSuccess = () => {
    refetchActivities();
  };

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Strava Integration</h1>
        <p className="text-muted-foreground">
          Connect with Strava to track your activities and fitness progress.
        </p>
      </div>

      {error && <StravaErrorDisplay error={error} />}

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
                  onSuccess={handleConnectionSuccess} 
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
