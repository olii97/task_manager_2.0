import React, { useState, useEffect } from 'react';
import { useAuth } from "@/components/AuthProvider";
import { checkStravaConnection, connectToStrava } from "@/services/strava";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { StravaActivity } from "@/types/strava";
import { ActivityDetails } from "@/components/strava/ActivityDetails";
import { useStravaActivities } from "@/hooks/useStravaActivities";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

const Strava: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null);
  const { stravaActivities, isLoading: activitiesLoading, fetchNextPage, isFetchingNextPage, hasNextPage } = useStravaActivities(session?.user?.id);

  useEffect(() => {
    const checkConnection = async () => {
      if (session?.user) {
        setLoading(true);
        const { isConnected, error } = await checkStravaConnection(session.user.id);
        if (error) {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          });
        }
        setIsConnected(isConnected);
        setLoading(false);
      } else {
        setIsConnected(false);
      }
    };

    checkConnection();
  }, [session, toast]);

  const handleConnect = async () => {
    if (!session?.user) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to connect to Strava.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { url, error } = await connectToStrava(session.access_token);
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else if (url) {
        window.location.href = url;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = (activity: StravaActivity) => {
    setSelectedActivity({
      ...activity,
      saved: false
    } as StravaActivity);
  };

  if (authLoading) {
    return <p>Loading authentication...</p>;
  }

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-4rem)]">
      {!isConnected ? (
        <Card className="max-w-2xl mx-auto shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Strava Integration</CardTitle>
            <CardDescription>
              Connect to Strava to sync your activities.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Button onClick={handleConnect} disabled={loading}>
              Connect to Strava
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-[400px_1fr] gap-6 h-full">
          {/* Activities List */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                {activitiesLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : stravaActivities && stravaActivities.length > 0 ? (
                  <div className="space-y-4">
                    <ul className="space-y-2">
                      {stravaActivities.map((activity) => (
                        <li
                          key={activity.id}
                          className={`cursor-pointer p-3 rounded-md transition-colors ${
                            selectedActivity?.id === activity.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => handleActivityClick(activity)}
                        >
                          <div className="font-medium">{activity.name}</div>
                          <div className="text-sm opacity-90">{activity.type}</div>
                        </li>
                      ))}
                    </ul>
                    
                    {hasNextPage && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={fetchNextPage}
                          disabled={isFetchingNextPage}
                        >
                          {isFetchingNextPage ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "Load More"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No recent activities found.</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Activity Details */}
          <Card className="h-full">
            <CardContent className="p-6 h-full">
              {selectedActivity ? (
                <ActivityDetails
                  activity={selectedActivity}
                  isOpen={true}
                  onClose={() => setSelectedActivity(null)}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select an activity to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Strava;
