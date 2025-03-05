
import { WeightEntry, TimeRange } from "@/types/weight";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";

interface WeightChartProps {
  entries: WeightEntry[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export function WeightChart({ entries, timeRange, onTimeRangeChange }: WeightChartProps) {
  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Prepare data for the chart
  const chartData = sortedEntries.map(entry => ({
    date: entry.created_at,
    weight: entry.weight,
    formattedDate: format(parseISO(entry.created_at), 'MMM d')
  }));

  // Calculate min and max for Y axis
  const weights = sortedEntries.map(entry => entry.weight);
  const minWeight = Math.min(...weights) * 0.99; // Add a little padding
  const maxWeight = Math.max(...weights) * 1.01;
  
  // Handle empty state
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight History</CardTitle>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={timeRange === '7days' ? 'default' : 'outline'} 
              onClick={() => onTimeRangeChange('7days')}
            >
              7 Days
            </Button>
            <Button 
              size="sm" 
              variant={timeRange === '14days' ? 'default' : 'outline'} 
              onClick={() => onTimeRangeChange('14days')}
            >
              14 Days
            </Button>
            <Button 
              size="sm" 
              variant={timeRange === '30days' ? 'default' : 'outline'} 
              onClick={() => onTimeRangeChange('30days')}
            >
              30 Days
            </Button>
            <Button 
              size="sm" 
              variant={timeRange === 'all' ? 'default' : 'outline'} 
              onClick={() => onTimeRangeChange('all')}
            >
              All Time
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-muted/20 rounded-md">
            <p className="text-muted-foreground">No weight entries available for this time period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight History</CardTitle>
        <div className="flex space-x-2 mt-2 overflow-x-auto pb-2">
          <Button 
            size="sm" 
            variant={timeRange === '7days' ? 'default' : 'outline'} 
            onClick={() => onTimeRangeChange('7days')}
          >
            7 Days
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === '14days' ? 'default' : 'outline'} 
            onClick={() => onTimeRangeChange('14days')}
          >
            14 Days
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === '30days' ? 'default' : 'outline'} 
            onClick={() => onTimeRangeChange('30days')}
          >
            30 Days
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === 'all' ? 'default' : 'outline'} 
            onClick={() => onTimeRangeChange('all')}
          >
            All Time
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }} 
                tickMargin={10} 
              />
              <YAxis 
                domain={[minWeight, maxWeight]} 
                tick={{ fontSize: 12 }} 
                tickMargin={10} 
                width={40} 
              />
              <Tooltip 
                formatter={(value) => [`${value} kg`, 'Weight']}
                labelFormatter={(label) => format(parseISO(chartData[label].date), 'MMM d, yyyy')}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ r: 4, fill: "#3b82f6" }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
