import { WeightEntry, WeightGoal, WeightStats } from "@/types/weight";

// Calculate a simple moving average for the trend line
export const calculateMovingAverage = (entries: WeightEntry[], windowSize: number = 3): Record<string, number> => {
  const result: Record<string, number> = {};
  
  for (let i = 0; i < entries.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = entries.slice(start, i + 1);
    const sum = window.reduce((acc, entry) => acc + entry.weight, 0);
    result[entries[i].created_at] = sum / window.length;
  }
  
  return result;
};

export const calculateWeightStats = (entries: WeightEntry[]) => {
  if (entries.length === 0) {
    return {
      currentWeight: 0,
      weightLost: 0,
      trendLine: {},
    };
  }

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  const currentWeight = sortedEntries[sortedEntries.length - 1].weight;
  let weightLost = 0;
  
  if (sortedEntries.length > 1) {
    const firstWeight = sortedEntries[0].weight;
    weightLost = Math.max(0, firstWeight - currentWeight);
  }

  return {
    currentWeight,
    weightLost,
    trendLine: calculateMovingAverage(sortedEntries),
  };
};

export const formatWeight = (weight: number): string => {
  return weight.toFixed(1);
};

export const calculateWeeklyLoss = (entries: WeightEntry[]): number => {
  if (entries.length < 2) return 0;

  const lastWeek = entries.slice(-7);
  if (lastWeek.length < 2) return 0;

  const oldestWeight = lastWeek[0].weight;
  const newestWeight = lastWeek[lastWeek.length - 1].weight;
  return oldestWeight - newestWeight;
};

export const calculateProgressPercentage = (entries: WeightEntry[], goal?: WeightGoal | null): number => {
  if (!goal || entries.length === 0) return 0;

  const totalToLose = goal.start_weight - goal.target_weight;
  const currentLoss = goal.start_weight - entries[entries.length - 1].weight;
  return Math.min(100, Math.max(0, (currentLoss / totalToLose) * 100));
}; 