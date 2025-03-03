
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

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
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      checkConnection();
    }
  }, [session]);

  const checkConnection = async () => {
    if (!session) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: tokens, error } = await supabase
        .from("strava_tokens")
        .select("*")
        .eq("user_id", session.user.id)
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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    if (!session) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Important change: Now passing the userId in the request body
      // instead of relying on the Authorization header
      const { data, error } = await supabase.functions.invoke<StravaActivity[]>(
        "strava-auth",
        {
          body: { 
            action: "get_activities",
            userId: session.user.id 
          }
        }
      );

      if (error) {
        console.error("Strava function error:", error);
        setError("Failed to fetch Strava activities. Please try reconnecting your account.");
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No activities found");
      } else {
        console.log("Fetched activities:", data.length);
      }

      setActivities(data || []);
    } catch (error: any) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to fetch Strava activities");
      setError(error.message || "Failed to fetch activities");
      
      // If we get an authorization error, we should disconnect
      if (error.message?.includes('No Strava tokens found') || 
          error.message?.includes('User not connected to Strava') ||
          error.message?.includes('Failed to refresh token')) {
        setIsConnected(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const connectStrava = async () => {
    if (!session) {
      toast.error("You must be logged in to connect Strava");
      return;
    }
    
    try {
      setIsConnecting(true);
      setError(null);

      // Make sure to pass the Authorization header with the JWT token
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
        console.error("Strava auth URL error:", response.error);
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
      setError(error.message || "Failed to connect to Strava");
      setIsConnecting(false);
    }
  };

  const disconnectStrava = async () => {
    if (!session) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("strava_tokens")
        .delete()
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error disconnecting Strava:", error);
        toast.error("Error disconnecting Strava");
        throw error;
      }

      setIsConnected(false);
      setActivities([]);
      toast.success("Disconnected from Strava");
    } catch (error) {
      console.error("Error disconnecting from Strava:", error);
    } finally {
      setIsLoading(false);
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

  if (!session) {
    return (
      <Card className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Strava Activities</h2>
        <p className="text-center text-muted-foreground py-4">
          You need to be logged in to connect Strava.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Strava Activities</h2>
      {!isConnected ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Connect your Strava account to track your activities
          </p>
          {error && (
            <p className="text-red-500 mb-4 text-sm">{error}</p>
          )}
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
          {error && (
            <div className="bg-red-50 p-3 rounded border border-red-200 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
              <div className="mt-2 flex gap-2">
                <Button 
                  onClick={fetchActivities} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  Try Again
                </Button>
                <Button 
                  onClick={disconnectStrava} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              <p className="mb-3">No activities found. Start tracking your workouts on Strava!</p>
              <Button 
                onClick={fetchActivities} 
                variant="outline" 
                size="sm"
                className="mr-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button 
                onClick={disconnectStrava} 
                variant="outline" 
                size="sm"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <>
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
              <div className="pt-4 flex justify-between">
                <Button 
                  onClick={fetchActivities} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Refresh
                    </>
                  )}
                </Button>
                <Button 
                  onClick={disconnectStrava} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  Disconnect
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
