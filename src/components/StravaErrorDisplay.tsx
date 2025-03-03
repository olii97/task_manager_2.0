
import { Button } from "@/components/ui/button";

interface StravaErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDisconnect?: () => void;
  isLoading?: boolean;
}

export function StravaErrorDisplay({ 
  error, 
  onRetry, 
  onDisconnect, 
  isLoading = false
}: StravaErrorDisplayProps) {
  return (
    <div className="bg-red-50 p-3 rounded border border-red-200 mb-4">
      <p className="text-red-600 text-sm">{error}</p>
      <div className="mt-2 flex gap-2">
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            Try Again
          </Button>
        )}
        {onDisconnect && (
          <Button 
            onClick={onDisconnect} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            Disconnect
          </Button>
        )}
      </div>
    </div>
  );
}
