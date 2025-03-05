
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

interface WeightInsightsProps {
  changes: {
    weekly: number | null;
    monthly: number | null;
  } | null;
}

export const WeightInsights = ({ changes }: WeightInsightsProps) => {
  if (!changes || (changes.weekly === null && changes.monthly === null)) {
    return null;
  }

  const hasWeeklyData = changes.weekly !== null;
  const hasMonthlyData = changes.monthly !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hasWeeklyData && (
            <div className="flex items-center gap-2">
              {changes.weekly > 0 ? (
                <TrendingUp className="h-5 w-5 text-destructive" />
              ) : changes.weekly < 0 ? (
                <TrendingDown className="h-5 w-5 text-strava-primary" />
              ) : null}
              <span>
                You {changes.weekly > 0 ? "gained" : "lost"} {Math.abs(changes.weekly).toFixed(1)} kg in the last week.
              </span>
            </div>
          )}
          
          {hasMonthlyData && (
            <div className="flex items-center gap-2">
              {changes.monthly > 0 ? (
                <TrendingUp className="h-5 w-5 text-destructive" />
              ) : changes.monthly < 0 ? (
                <TrendingDown className="h-5 w-5 text-strava-primary" />
              ) : null}
              <span>
                You {changes.monthly > 0 ? "gained" : "lost"} {Math.abs(changes.monthly).toFixed(1)} kg in the last 30 days.
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
