
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date: string;
}

export const StravaActivities = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: activities, isLoading, error } = useQuery({
    queryKey: ["strava-activities"],
    queryFn: async () => {
      const { data: activities, error } = await supabase.functions.invoke<StravaActivity[]>("strava-auth", {
        body: { action: "get-activities" }
      });

      if (error) throw error;
      return activities || [];
    },
  });

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const { data, error } = await supabase.functions.invoke<{ url: string }>("strava-auth", {
        body: { action: "auth-url" }
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No authorization URL returned");
      
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Strava connection error:", error);
      toast.error("Error connecting to Strava: " + (error.message || "Unknown error"));
    } finally {
      setIsConnecting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const formatDistance = (meters: number) => {
    const kilometers = meters / 1000;
    return `${kilometers.toFixed(2)} km`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (isLoading) {
    return <div>Loading activities...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border p-6 bg-card">
        <h3 className="text-lg font-semibold mb-4">Connect Strava</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Failed to load Strava activities"}
        </p>
        <Button onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect Strava"}
        </Button>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-lg border p-6 bg-card">
        <h3 className="text-lg font-semibold mb-4">Connect Strava</h3>
        <p className="text-muted-foreground mb-4">
          Connect your Strava account to see your recent activities in your journal.
        </p>
        <Button onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect Strava"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Strava Activities</h3>
      <div className="grid gap-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 rounded-lg border p-4 bg-card"
          >
            <div className="flex-1">
              <h4 className="font-medium">{activity.name}</h4>
              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(activity.start_date)}
                </div>
                <p>
                  {activity.type} • {formatDistance(activity.distance)} • {formatDuration(activity.moving_time)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
