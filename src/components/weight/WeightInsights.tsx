
import { WeightEntry, WeightStats } from "@/types/weight";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateWeightStats } from "@/services/weightService";
import { TrendingDown, TrendingUp } from "lucide-react";

interface WeightInsightsProps {
  entries: WeightEntry[];
}

export function WeightInsights({ entries }: WeightInsightsProps) {
  // Calculate insights for different time periods
  const weeklyStats = calculateWeightStats(
    entries.filter(entry => 
      new Date(entry.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ),
    'week'
  );

  const monthlyStats = calculateWeightStats(
    entries.filter(entry => 
      new Date(entry.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ),
    'month'
  );

  if (entries.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trend Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            Add more weight entries to see trends and insights.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InsightCard stats={weeklyStats} title="Last 7 Days" />
          <InsightCard stats={monthlyStats} title="Last 30 Days" />
        </div>
      </CardContent>
    </Card>
  );
}

interface InsightCardProps {
  stats: WeightStats;
  title: string;
}

function InsightCard({ stats, title }: InsightCardProps) {
  if (!stats.change) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-sm mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Not enough data for this period.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium text-sm mb-2">{title}</h3>
      
      <div className="flex items-center">
        {stats.change > 0 ? (
          <>
            <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="font-semibold text-red-500">
                Gained {stats.change.toFixed(1)} kg
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.abs(stats.changePercentage!).toFixed(1)}% increase
              </p>
            </div>
          </>
        ) : stats.change < 0 ? (
          <>
            <TrendingDown className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="font-semibold text-green-500">
                Lost {Math.abs(stats.change).toFixed(1)} kg
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.abs(stats.changePercentage!).toFixed(1)}% decrease
              </p>
            </div>
          </>
        ) : (
          <p className="font-medium">No change in weight</p>
        )}
      </div>
    </div>
  );
}
