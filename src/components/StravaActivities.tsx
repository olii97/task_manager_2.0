
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { StravaActivity, SavedStravaActivity, toSavedStravaActivity } from "@/types/strava";
import { StravaConnectForm } from "./StravaConnectForm";
import { StravaActivityList } from "./StravaActivityList";
import { StravaErrorDisplay } from "./StravaErrorDisplay";
import { 
  checkStravaConnection, 
  getStravaActivities, 
  disconnectFromStrava, 
  connectToStrava
} from "@/services/strava";
import { StravaConnectionResult, StravaActivitiesResult, StravaAuthUrlResult } from "@/services/strava/types";

export function StravaActivities() {
  const [activities, setActivities] = useState<SavedStravaActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const { toast } = useToast();

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
      
      const result: StravaConnectionResult = await checkStravaConnection(session.user.id);
      setIsConnected(result.isConnected);
      
      if (result.isConnected) {
        await fetchActivities();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    if (!session) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const activities = await getStravaActivities(session.user.id);
      
      // Set the activities directly
      setActivities(activities as SavedStravaActivity[]);
    } catch (error: any) {
      console.error("Error fetching activities:", error);
      setError(error.message || "Failed to fetch activities");
      
      // If we get an authorization error, we should disconnect
      if (error.message && (
          error.message.includes('No Strava tokens found') || 
          error.message.includes('User not connected to Strava') ||
          error.message.includes('Failed to refresh token'))) {
        setIsConnected(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const connectStrava = async () => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to connect Strava",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      setError(null);

      const result: StravaAuthUrlResult = await connectToStrava(session.access_token);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.url) {
        // Open the URL in the current window
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to connect to Strava",
        variant: "destructive"
      });
      setError(error.message || "Failed to connect to Strava");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectStrava = async () => {
    if (!session) return;
    
    try {
      setIsLoading(true);
      
      const result = await disconnectFromStrava(session.user.id);
      
      if (result.error) {
        toast({
          title: "Error",
          description: "Error disconnecting Strava",
          variant: "destructive"
        });
        return;
      }

      setIsConnected(false);
      setActivities([]);
      toast({
        title: "Success",
        description: "Disconnected from Strava"
      });
    } finally {
      setIsLoading(false);
    }
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
        <StravaConnectForm 
          isConnecting={isConnecting}
          error={error}
          onConnect={connectStrava}
        />
      ) : (
        <div className="space-y-4">
          {error && (
            <StravaErrorDisplay 
              error={error}
              onRetry={fetchActivities}
              onDisconnect={disconnectStrava}
              isLoading={isLoading}
            />
          )}
          
          <StravaActivityList 
            activities={activities}
            isLoading={isLoading}
            onRefresh={fetchActivities}
            onDisconnect={disconnectStrava}
          />
        </div>
      )}
    </Card>
  );
}
