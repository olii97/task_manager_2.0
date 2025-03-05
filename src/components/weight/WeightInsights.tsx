
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeightEntry, WeightStats } from "@/types/weight";
import { calculateWeightStats } from "@/services/weightService";
import { subDays } from "date-fns";
import { ArrowUpIcon, ArrowDownIcon, Minus } from "lucide-react";

interface WeightInsightsProps {
  entries: WeightEntry[];
}

export function WeightInsights({ entries }: WeightInsightsProps) {
  const weeklyStats = React.useMemo(() => {
    const weeklyEntries = entries.filter(entry => 
      new Date(entry.created_at) >= subDays(new Date(), 7)
    );
    return calculateWeightStats(weeklyEntries, '7 days');
  }, [entries]);

  const monthlyStats = React.useMemo(() => {
    const monthlyEntries = entries.filter(entry => 
      new Date(entry.created_at) >= subDays(new Date(), 30)
    );
    return calculateWeightStats(monthlyEntries, '30 days');
  }, [entries]);

  const hasInsights = weeklyStats.change !== null || monthlyStats.change !== null;

  if (!hasInsights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-3 text-muted-foreground">
            Need more entries to show insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard stats={weeklyStats} />
          <StatCard stats={monthlyStats} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ stats }: { stats: WeightStats }) {
  if (stats.change === null) return null;

  const isGain = stats.change > 0;
  const isLoss = stats.change < 0;
  const isNeutral = stats.change === 0;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
      <h3 className="text-sm text-muted-foreground mb-2">
        Past {stats.period}:
      </h3>
      <div className="flex items-center space-x-2">
        {isGain && <ArrowUpIcon className="text-red-500" />}
        {isLoss && <ArrowDownIcon className="text-green-500" />}
        {isNeutral && <Minus className="text-slate-500" />}
        
        <span className={`text-xl font-semibold ${
          isGain ? 'text-red-500' : 
          isLoss ? 'text-green-500' : 
          'text-slate-500'
        }`}>
          {isGain ? '+' : ''}
          {Math.abs(stats.change).toFixed(1)} kg
        </span>
      </div>
      {stats.changePercentage !== null && (
        <p className="text-sm text-muted-foreground mt-1">
          {isGain ? 'Gained' : isLoss ? 'Lost' : 'Maintained'} {Math.abs(stats.changePercentage).toFixed(1)}% 
          {stats.current && ` (Now: ${stats.current.toFixed(1)} kg)`}
        </p>
      )}
    </div>
  );
}
