
import { WeightEntry } from "@/types/weight";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { TimeRange } from "@/hooks/useWeightEntries";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface WeightChartProps {
  entries: WeightEntry[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export function WeightChart({ entries, timeRange, onTimeRangeChange }: WeightChartProps) {
  // Filter entries based on time range
  const getFilteredEntries = () => {
    if (!entries.length) return [];
    
    const now = new Date();
    let daysToSubtract = 7;
    
    if (timeRange === '14days') daysToSubtract = 14;
    else if (timeRange === '30days') daysToSubtract = 30;
    else if (timeRange === 'all') return [...entries].reverse();
    
    const dateThreshold = subDays(now, daysToSubtract);
    return [...entries]
      .filter(entry => parseISO(entry.created_at) >= dateThreshold)
      .reverse();
  };

  const chartData = getFilteredEntries().map(entry => ({
    date: format(parseISO(entry.created_at), 'MMM d'),
    weight: entry.weight
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Weight Trend</CardTitle>
        <ToggleGroup 
          type="single" 
          value={timeRange} 
          onValueChange={(value) => value && onTimeRangeChange(value as TimeRange)}
          className="flex-shrink-0"
          size="sm"
        >
          <ToggleGroupItem value="7days">7 Days</ToggleGroupItem>
          <ToggleGroupItem value="14days">14 Days</ToggleGroupItem>
          <ToggleGroupItem value="30days">30 Days</ToggleGroupItem>
          <ToggleGroupItem value="all">All</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent className="h-[300px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No weight data available for the selected time range
          </div>
        )}
      </CardContent>
    </Card>
  );
}
