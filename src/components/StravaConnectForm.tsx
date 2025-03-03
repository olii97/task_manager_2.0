
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface StravaConnectFormProps {
  isConnecting: boolean;
  error: string | null;
  onConnect: () => void;
}

export function StravaConnectForm({ 
  isConnecting, 
  error, 
  onConnect 
}: StravaConnectFormProps) {
  return (
    <div className="text-center">
      <p className="text-muted-foreground mb-4">
        Connect your Strava account to track your activities
      </p>
      {error && (
        <p className="text-red-500 mb-4 text-sm">{error}</p>
      )}
      <Button onClick={onConnect} disabled={isConnecting}>
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
  );
}
