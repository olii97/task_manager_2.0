
import { useAuth } from "@/components/AuthProvider";
import { useWeightEntries } from "@/hooks/useWeightEntries";
import { WeightLogModal } from "@/components/weight/WeightLogModal";
import { BodyFeelingModal } from "@/components/weight/BodyFeelingModal";
import { WeightChart } from "@/components/weight/WeightChart";
import { WeightHistoryTable } from "@/components/weight/WeightHistoryTable";
import { WeightInsights } from "@/components/weight/WeightInsights";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Weight() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const {
    entries,
    isEntriesLoading,
    timeRange,
    setTimeRange,
    logModalOpen,
    setLogModalOpen,
    feelingModalOpen,
    setFeelingModalOpen,
    handleLogWeight,
    handleLogFeelingAndWeight,
    deleteEntry
  } = useWeightEntries(userId);

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Weight Tracker</h1>
        <Button onClick={() => setLogModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Weight
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Weight Chart */}
        <WeightChart 
          entries={entries} 
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          isLoading={isEntriesLoading}
        />

        {/* Insights Section */}
        <WeightInsights entries={entries} />

        {/* Weight History Table */}
        <WeightHistoryTable 
          entries={entries} 
          onDelete={deleteEntry} 
        />
      </div>

      {/* Weight Log Modal */}
      <WeightLogModal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        onSave={handleLogWeight}
      />

      {/* Body Feeling Modal */}
      <BodyFeelingModal
        open={feelingModalOpen}
        onClose={() => setFeelingModalOpen(false)}
        onSave={handleLogFeelingAndWeight}
      />
    </div>
  );
}
