
import { useAuth } from "@/components/AuthProvider";
import { useWeightEntries } from "@/hooks/useWeightEntries";
import { LogWeightModal } from "@/components/weight/LogWeightModal";
import { BodyFeelingModal } from "@/components/weight/BodyFeelingModal";
import { WeightChart } from "@/components/weight/WeightChart";
import { WeightHistory } from "@/components/weight/WeightHistory";
import { WeightInsights } from "@/components/weight/WeightInsights";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

const Weight = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  const {
    entries,
    isEntriesLoading,
    logModalOpen,
    setLogModalOpen,
    feelingModalOpen,
    setFeelingModalOpen,
    timeRange,
    setTimeRange,
    changes,
    logWeight,
    recordBodyFeeling,
    deleteEntry,
  } = useWeightEntries(userId);

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Weight Tracker</h1>
        <Button onClick={() => setLogModalOpen(true)}>
          <Scale className="h-4 w-4 mr-2" /> Log Weight
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Chart */}
        <WeightChart
          entries={entries}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />

        {/* Insights */}
        <WeightInsights changes={changes} />

        {/* History */}
        <WeightHistory 
          entries={entries}
          onDeleteEntry={deleteEntry}
        />
      </div>

      {/* Modals */}
      <LogWeightModal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        onSave={logWeight}
      />

      <BodyFeelingModal
        open={feelingModalOpen}
        onClose={() => setFeelingModalOpen(false)}
        onSave={recordBodyFeeling}
      />
    </div>
  );
};

export default Weight;
