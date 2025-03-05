
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, parseISO } from "date-fns";
import { WeightEntry } from "@/types/weight";
import { TrendingDown, TrendingUp, Weight } from "lucide-react";

interface WeightHomeTileProps {
  entry: WeightEntry | null;
  isLoading: boolean;
  onLogWeight: () => void;
  onViewProgress: () => void;
}

export function WeightHomeTile({ entry, isLoading, onLogWeight, onViewProgress }: WeightHomeTileProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-2">
            <div className="h-6 w-3/4 bg-muted rounded"></div>
            <div className="h-4 w-1/2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        {entry ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Weight className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-lg font-medium">Weight Tracker</h3>
              </div>
              <Button variant="outline" size="sm" onClick={onLogWeight}>Log Weight</Button>
            </div>
            
            <div className="mt-2">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">{entry.weight} kg</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {formatDistanceToNow(parseISO(entry.created_at), { addSuffix: true })}
                </span>
              </div>
              
              {entry.body_feeling && (
                <div className="mt-1 text-sm text-muted-foreground">
                  Feeling: {entry.body_feeling} 
                  {entry.body_feeling === 'Sore' && ' 😣'}
                  {entry.body_feeling === 'Relaxed' && ' 😌'}
                  {entry.body_feeling === 'Energized' && ' ⚡'}
                  {entry.body_feeling === 'Stressed' && ' 😰'}
                  {entry.body_feeling === 'Tired' && ' 😴'}
                  {entry.body_feeling === 'Other' && ' 🤔'}
                </div>
              )}
            </div>
            
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto mt-2" 
              onClick={onViewProgress}
            >
              View Progress →
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center">
                <Weight className="h-5 w-5 mr-2 text-blue-500" />
                Weight Tracker
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">No weight logged yet. Tap to add.</p>
            <div className="flex flex-col space-y-2">
              <Button onClick={onLogWeight}>Log Weight</Button>
              <Button variant="link" size="sm" className="p-0 h-auto" onClick={onViewProgress}>
                View Progress →
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
