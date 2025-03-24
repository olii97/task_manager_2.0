import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { fetchWeightEntries, addWeightEntry } from "@/services/weight";
import { WeightEntry } from "@/types/weight";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { calculateWeightStats } from "@/utils/weight";
import { DashboardCard } from "@/components/ui/dashboard-card";

interface WeightTrackerCardProps {
  userId: string | undefined;
}

export const WeightTrackerCard = ({ userId }: WeightTrackerCardProps) => {
  const [newWeight, setNewWeight] = useState("");
  const { toast } = useToast();

  // Fetch weight entries
  const { data: entries = [], refetch } = useQuery({
    queryKey: ["weight-entries", userId],
    queryFn: () => fetchWeightEntries(userId!),
    enabled: !!userId,
  });

  // Calculate stats
  const stats = calculateWeightStats(entries);

  // Handle adding new weight entry
  const handleAddWeight = async () => {
    if (!userId || !newWeight) return;

    const weight = parseFloat(newWeight);
    if (isNaN(weight)) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    try {
      await addWeightEntry(userId, { weight });
      setNewWeight("");
      toast({
        title: "Weight added",
        description: "Your weight has been recorded successfully",
      });
      refetch(); // Refresh the entries after adding a new one
    } catch (error) {
      console.error("Error adding weight entry:", error);
      toast({
        title: "Error",
        description: "Failed to add weight entry",
        variant: "destructive",
      });
    }
  };

  // Prepare data for the chart - last 7 entries or all if less than 7
  const chartData = entries
    .slice(-7)
    .map(entry => ({
      date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: entry.weight,
    }));

  return (
    <DashboardCard id="weight-tracker" title="Weight Tracker">
      <div className="space-y-4">
        {/* Current weight and stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Weight</p>
            <p className="text-2xl font-bold">{stats.currentWeight.toFixed(1)} kg</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Weight Lost</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.weightLost > 0 ? `-${stats.weightLost.toFixed(1)} kg` : '0 kg'}
            </p>
          </div>
        </div>

        {/* Mini chart */}
        <div className="h-[100px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-sm">No weight data yet</p>
            </div>
          )}
        </div>

        {/* Quick add form */}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Enter weight"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddWeight()}
            step="0.1"
          />
          <Button onClick={handleAddWeight}>Add</Button>
        </div>
      </div>
    </DashboardCard>
  );
}; 