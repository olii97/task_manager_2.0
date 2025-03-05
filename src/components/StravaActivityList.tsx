
import { Button } from "@/components/ui/button";
import { SavedStravaActivity } from "@/types/strava";
import { StravaActivityItem } from "./StravaActivityItem";
import { Loader2, RefreshCw } from "lucide-react";

interface StravaActivityListProps {
  activities: SavedStravaActivity[];
  isLoading: boolean;
  onRefresh?: () => void;
  onDisconnect?: () => void;
  onSelectActivity?: (activity: SavedStravaActivity) => void;
  onSave?: (activity: SavedStravaActivity) => void;
  compact?: boolean;
}

export function StravaActivityList({ 
  activities, 
  isLoading, 
  onRefresh,
  onDisconnect,
  onSelectActivity,
  onSave,
  compact = false
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
        {onRefresh && (
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm"
            className="mr-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        )}
        {onDisconnect && (
          <Button 
            onClick={onDisconnect} 
            variant="outline" 
            size="sm"
          >
            Disconnect
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={`divide-y ${compact ? 'space-y-2' : ''}`}>
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            onClick={() => onSelectActivity && onSelectActivity(activity)}
            className={onSelectActivity ? "cursor-pointer hover:bg-gray-50 rounded-md transition-colors" : ""}
          >
            <StravaActivityItem 
              activity={activity} 
              compact={compact}
            />
          </div>
        ))}
      </div>
      {(onRefresh || onDisconnect) && (
        <div className="pt-4 flex justify-between">
          {onRefresh && (
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
      )}
    </>
  );
}
