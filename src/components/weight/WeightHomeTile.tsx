
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { BodyFeeling, bodyFeelingEmoji } from "@/types/weight";
import { Link } from "react-router-dom";

interface WeightHomeTileProps {
  latestEntry: {
    weight: number;
    timeAgo: string;
    feeling: BodyFeeling | null;
  } | null;
  isLoading: boolean;
  onLogWeight: () => void;
}

export const WeightHomeTile = ({ 
  latestEntry, 
  isLoading, 
  onLogWeight 
}: WeightHomeTileProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Weight Tracker</CardTitle>
        <Button variant="outline" size="sm" onClick={onLogWeight}>
          <Scale className="h-4 w-4 mr-1" /> Log Weight
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-16 bg-muted animate-pulse rounded-md"></div>
        ) : (
          <div className="space-y-2">
            {latestEntry ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold">{latestEntry.weight} kg</span>
                  {latestEntry.feeling && (
                    <span className="text-xl" title={latestEntry.feeling}>
                      {bodyFeelingEmoji[latestEntry.feeling]}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Last updated {latestEntry.timeAgo}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                No weight logged yet. Tap "Log Weight" to add your first entry.
              </p>
            )}
            <div className="pt-2">
              <Button variant="link" size="sm" className="px-0" asChild>
                <Link to="/weight">
                  View Progress <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
