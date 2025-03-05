
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { format, parseISO } from "date-fns";
import { WeightEntry, TimeRange } from "@/types/weight";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2 } from "lucide-react";

interface WeightChartProps {
  entries: WeightEntry[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  isLoading?: boolean;
}

export function WeightChart({ entries, timeRange, onTimeRangeChange, isLoading = false }: WeightChartProps) {
  const processedData = React.useMemo(() => {
    // Sort by date (oldest first for the chart)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return sortedEntries.map(entry => ({
      date: format(parseISO(entry.created_at), 'MMM dd'),
      weight: entry.weight,
      timestamp: entry.created_at, // Keep the raw timestamp for tooltip
    }));
  }, [entries]);

  const weightStats = React.useMemo(() => {
    if (processedData.length === 0) return { min: 0, max: 100, avg: 0 };
    
    const weights = processedData.map(d => d.weight);
    const min = Math.floor(Math.min(...weights) * 0.99);
    const max = Math.ceil(Math.max(...weights) * 1.01);
    const avg = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    
    return { min, max, avg };
  }, [processedData]);

  const isEmptyState = !isLoading && processedData.length < 2;

  const handleTimeRangeChange = (value: string) => {
    if (value) {
      onTimeRangeChange(value as TimeRange);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Weight History</span>
          <ToggleGroup type="single" value={timeRange} onValueChange={handleTimeRangeChange}>
            <ToggleGroupItem value="7days">7 Days</ToggleGroupItem>
            <ToggleGroupItem value="14days">14 Days</ToggleGroupItem>
            <ToggleGroupItem value="30days">30 Days</ToggleGroupItem>
            <ToggleGroupItem value="all">All</ToggleGroupItem>
          </ToggleGroup>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isEmptyState ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-muted-foreground">
              {processedData.length === 0 
                ? "No weight entries yet" 
                : "Need at least two entries to show a chart"}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processedData}
              margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[weightStats.min, weightStats.max]}
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} kg`}
              />
              <Tooltip 
                formatter={(value) => [`${value} kg`, 'Weight']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <ReferenceLine y={weightStats.avg} stroke="#888" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
