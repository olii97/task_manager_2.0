
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface StravaConnectFormProps {
  isConnecting?: boolean;
  isConnected?: boolean;
  error?: string | null;
  onConnect?: () => void;
  onSuccess?: () => void;
}

export function StravaConnectForm({ 
  isConnecting = false, 
  isConnected = false,
  error = null, 
  onConnect,
  onSuccess
}: StravaConnectFormProps) {
  const handleConnect = () => {
    if (onConnect) {
      onConnect();
    }
  };

  return (
    <div className="text-center">
      <p className="text-muted-foreground mb-4">
        {isConnected 
          ? "Your Strava account is connected." 
          : "Connect your Strava account to track your activities"}
      </p>
      {error && (
        <p className="text-red-500 mb-4 text-sm">{error}</p>
      )}
      <Button 
        onClick={handleConnect} 
        disabled={isConnecting || isConnected}
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : isConnected ? (
          "Connected to Strava"
        ) : (
          "Connect Strava"
        )}
      </Button>
    </div>
  );
}
