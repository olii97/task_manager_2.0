
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { WeightEntry } from "@/types/weight";
import { Loader2 } from "lucide-react";

interface WeightHomeTileProps {
  latestEntry: WeightEntry | null;
  isLoading: boolean;
  onLogWeight: () => void;
}

export function WeightHomeTile({ latestEntry, isLoading, onLogWeight }: WeightHomeTileProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="col-span-1 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Weight Tracker</span>
          <Button variant="ghost" size="sm" onClick={() => navigate("/weight")}>
            View Progress →
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : latestEntry ? (
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {latestEntry.weight} kg
            </div>
            <div className="text-sm text-muted-foreground">
              Last entry: {formatDistanceToNow(new Date(latestEntry.created_at), { addSuffix: true })}
            </div>
            {latestEntry.body_feeling && (
              <div className="text-sm">
                Feeling: {latestEntry.body_feeling}
              </div>
            )}
            <Button onClick={onLogWeight} className="w-full mt-4">Log Weight</Button>
          </div>
        ) : (
          <div className="space-y-4 py-6">
            <p className="text-center text-muted-foreground">No weight entries yet</p>
            <Button onClick={onLogWeight} className="w-full">Log Weight</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
