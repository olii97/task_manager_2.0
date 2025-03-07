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

const Strava: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null);
  const { stravaActivities, isLoading: activitiesLoading } = useStravaActivities(session?.user.id);

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
    console.log("Activity clicked:", activity);
    if (activity.id) {
      setSelectedActivity({
        ...activity,
        saved: false // Ensure the saved property is set
      });
      setShowActivityDetails(true);
    }
  };

  const handleCloseDetails = () => {
    setShowActivityDetails(false);
    setSelectedActivity(null);
  };

  if (authLoading) {
    return <p>Loading authentication...</p>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Strava Integration</CardTitle>
          <CardDescription>
            {isConnected === true
              ? "You are connected to Strava."
              : "Connect to Strava to sync your activities."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <p>Checking connection...</p>
          ) : isConnected === true ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
              {activitiesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : stravaActivities && stravaActivities.length > 0 ? (
                <ul className="space-y-2">
                  {stravaActivities.map((activity) => (
                    <li
                      key={activity.id}
                      className="cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                      onClick={() => handleActivityClick(activity)}
                    >
                      {activity.name} ({activity.type})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recent activities found.</p>
              )}
            </>
          ) : (
            <Button onClick={handleConnect} disabled={loading}>
              Connect to Strava
            </Button>
          )}
        </CardContent>
      </Card>

      {showActivityDetails && selectedActivity && (
        <ActivityDetails
          activity={selectedActivity}
          isOpen={showActivityDetails}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default Strava;
