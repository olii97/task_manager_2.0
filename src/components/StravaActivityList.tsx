
import { Button } from "@/components/ui/button";
import { StravaActivity } from "@/types/strava";
import { StravaActivityItem } from "./StravaActivityItem";
import { Loader2, RefreshCw } from "lucide-react";

interface StravaActivityListProps {
  activities: StravaActivity[];
  isLoading: boolean;
  onRefresh: () => void;
  onDisconnect: () => void;
}

export function StravaActivityList({ 
  activities, 
  isLoading, 
  onRefresh, 
  onDisconnect 
}: StravaActivityListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading activities...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        <p className="mb-3">No activities found. Start tracking your workouts on Strava!</p>
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          size="sm"
          className="mr-2"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
        <Button 
          onClick={onDisconnect} 
          variant="outline" 
          size="sm"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y">
        {activities.map((activity) => (
          <StravaActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
      <div className="pt-4 flex justify-between">
        <Button 
          onClick={onRefresh} 
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
          onClick={onDisconnect} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
        >
          Disconnect
        </Button>
      </div>
    </>
  );
}
