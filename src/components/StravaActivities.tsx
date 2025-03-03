
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { StravaActivity } from "@/types/strava";
import { StravaConnectForm } from "./StravaConnectForm";
import { StravaActivityList } from "./StravaActivityList";
import { StravaErrorDisplay } from "./StravaErrorDisplay";
import { 
  checkStravaConnection, 
  connectToStrava, 
  disconnectFromStrava, 
  fetchStravaActivities 
} from "@/services/stravaService";

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
      
      const result = await checkStravaConnection(session.user.id);
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
      
      const result = await fetchStravaActivities(session.user.id);
      
      if (result.error) {
        setError("Failed to fetch Strava activities. Please try reconnecting your account.");
        
        // If we get an authorization error, we should disconnect
        if (result.error.includes('No Strava tokens found') || 
            result.error.includes('User not connected to Strava') ||
            result.error.includes('Failed to refresh token')) {
          setIsConnected(false);
        }
        return;
      }
      
      setActivities(result.activities);
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

      const result = await connectToStrava(session.access_token);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.url) {
        // Open the URL in the current window
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error("Failed to connect to Strava");
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
        toast.error("Error disconnecting Strava");
        return;
      }

      setIsConnected(false);
      setActivities([]);
      toast.success("Disconnected from Strava");
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
