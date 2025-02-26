
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date_local: string;
}

export function StravaActivities() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data: tokens, error } = await supabase
        .from("strava_tokens")
        .select("*")
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not the "no rows returned" error
          console.error("Error checking Strava connection:", error);
          toast.error("Error checking Strava connection");
        }
        setIsConnected(false);
        return;
      }

      setIsConnected(!!tokens);
      if (tokens) {
        fetchActivities();
      }
    } catch (error) {
      console.error("Error checking Strava connection:", error);
      setIsConnected(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      const { data, error } = await supabase.functions.invoke<StravaActivity[]>(
        "strava-auth",
        {
          body: { action: "get_activities" },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;

      setActivities(data || []);
    } catch (error: any) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to fetch Strava activities");
      // If we get an authorization error, we should disconnect
      if (error.message?.includes('No Strava tokens found')) {
        setIsConnected(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const connectStrava = async () => {
    try {
      setIsConnecting(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      const response = await supabase.functions.invoke<{ url: string }>(
        "strava-auth",
        {
          body: { action: "get_auth_url" },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.error) {
        throw response.error;
      }

      if (!response.data?.url) {
        throw new Error("No authorization URL received");
      }

      // Open the URL in the current window
      window.location.href = response.data.url;
    } catch (error: any) {
      console.error("Error connecting to Strava:", error);
      toast.error("Failed to connect to Strava");
      setIsConnecting(false);
    }
  };

  const formatDistance = (meters: number) => {
    const kilometers = (meters / 1000).toFixed(2);
    return `${kilometers} km`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Strava Activities</h2>
      {!isConnected ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Connect your Strava account to track your activities
          </p>
          <Button onClick={connectStrava} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Strava"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No activities found. Start tracking your workouts on Strava!
            </p>
          ) : (
            <div className="divide-y">
              {activities.map((activity) => (
                <div key={activity.id} className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{activity.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {activity.type} • {formatDate(activity.start_date_local)}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{formatDistance(activity.distance)}</p>
                      <p className="text-muted-foreground">
                        {formatTime(activity.moving_time)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
