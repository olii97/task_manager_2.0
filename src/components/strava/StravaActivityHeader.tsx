
import { SavedStravaActivity } from "@/types/strava";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

interface StravaActivityHeaderProps {
  activity: SavedStravaActivity;
  onBack: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function StravaActivityHeader({
  activity,
  onBack,
  onSave,
  isSaved = false
}: StravaActivityHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">{activity.name}</h2>
      </div>
      
      {onSave && (
        <Button 
          variant={isSaved ? "destructive" : "default"}
          size="sm"
          onClick={onSave}
        >
          {isSaved ? (
            <>
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              Save Activity
            </>
          )}
        </Button>
      )}
    </div>
  );
}
