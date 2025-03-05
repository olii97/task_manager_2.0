
import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { WeightEntry } from "@/types/weight";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WeightChartProps {
  entries: WeightEntry[];
  timeRange: "7days" | "14days" | "30days";
  onTimeRangeChange: (range: "7days" | "14days" | "30days") => void;
}

interface ChartData {
  date: string;
  weight: number;
  formattedDate: string;
}

export const WeightChart = ({ entries, timeRange, onTimeRangeChange }: WeightChartProps) => {
  const days = timeRange === "7days" ? 7 : timeRange === "14days" ? 14 : 30;
  
  const chartData = useMemo(() => {
    if (!entries.length) return [];
    
    // Get date range for chart
    const today = new Date();
    const startDate = subDays(today, days - 1);
    
    // Create map of dates to weights (most recent entry per day)
    const entriesByDate = new Map<string, number>();
    
    // Sort entries by date, oldest first
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Map entries to dates
    sortedEntries.forEach(entry => {
      const date = format(parseISO(entry.created_at), "yyyy-MM-dd");
      entriesByDate.set(date, entry.weight);
    });
    
    // Create chart data array with continuous dates
    const data: ChartData[] = [];
    let lastWeight: number | null = null;
    
    // For each day in range
    for (let i = 0; i < days; i++) {
      const date = format(subDays(today, days - 1 - i), "yyyy-MM-dd");
      const formattedDate = format(parseISO(date), "MMM d");
      
      // If we have a weight for this date, use it
      if (entriesByDate.has(date)) {
        lastWeight = entriesByDate.get(date)!;
        data.push({
          date,
          weight: lastWeight,
          formattedDate
        });
      } 
      // If we have a previous weight and this is within our entry date range, use the last weight
      else if (lastWeight !== null && 
               date >= format(parseISO(sortedEntries[0].created_at), "yyyy-MM-dd") &&
               date <= format(parseISO(sortedEntries[sortedEntries.length - 1].created_at), "yyyy-MM-dd")) {
        data.push({
          date,
          weight: lastWeight,
          formattedDate
        });
      }
    }
    
    return data;
  }, [entries, days]);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 shadow-md rounded-md">
          <p className="font-medium">{format(parseISO(label), "MMM d, yyyy")}</p>
          <p className="text-primary">{`${payload[0].value} kg`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Weight Trend</CardTitle>
        <Select
          value={timeRange}
          onValueChange={(value) => onTimeRangeChange(value as any)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="14days">Last 14 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="formattedDate" 
                  stroke="currentColor" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="currentColor"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available for the selected time range
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
