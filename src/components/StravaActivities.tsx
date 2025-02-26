
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data: tokens } = await supabase
        .from("strava_tokens")
        .select("*")
        .single();
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
      const { data: activities, error } = await supabase.functions.invoke(
        "strava-auth",
        {
          body: { action: "get_activities" },
        }
      );

      if (error) throw error;

      setActivities(activities);
    } catch (error: any) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to fetch Strava activities");
    } finally {
      setIsLoading(false);
    }
  };

  const connectStrava = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("strava-auth", {
        body: { action: "get_auth_url" },
      });

      if (error) throw error;
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error connecting to Strava:", error);
      toast.error("Failed to connect to Strava");
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
          <Button onClick={connectStrava}>Connect Strava</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">
              Loading activities...
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
