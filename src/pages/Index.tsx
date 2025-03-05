
import { useAuth } from "@/components/AuthProvider";
import { FeaturedGoal } from "@/components/FeaturedGoal";
import { WeeklyIntentionsCard } from "@/components/WeeklyIntentionsCard";
import { TodaysJournalCard } from "@/components/home/TodaysJournalCard";
import { StravaActivitiesCard } from "@/components/home/StravaActivitiesCard";
import { WeightHomeTile } from "@/components/home/WeightHomeTile";
import { useJournalEntry } from "@/hooks/useJournalEntry";
import { useWeightEntries } from "@/hooks/useWeightEntries";
import { WeightLogModal } from "@/components/weight/WeightLogModal";
import { BodyFeelingModal } from "@/components/weight/BodyFeelingModal";

export default function Index() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { todayEntry } = useJournalEntry(userId);

  // Use the weight entries hook for the home page
  const {
    latestEntry,
    isLatestLoading,
    logModalOpen,
    setLogModalOpen,
    feelingModalOpen,
    setFeelingModalOpen,
    handleLogWeight,
    handleLogFeelingAndWeight
  } = useWeightEntries(userId);

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <TodaysJournalCard entry={todayEntry} />
        <WeeklyIntentionsCard />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <FeaturedGoal />
        
        {/* Weight Tracking Tile */}
        <WeightHomeTile 
          latestEntry={latestEntry}
          isLoading={isLatestLoading}
          onLogWeight={() => setLogModalOpen(true)}
        />

        <StravaActivitiesCard />
      </div>
      
      {/* Weight Modals */}
      <WeightLogModal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        onSave={handleLogWeight}
      />
      
      <BodyFeelingModal
        open={feelingModalOpen}
        onClose={() => setFeelingModalOpen(false)}
        onSave={handleLogFeelingAndWeight}
      />
    </div>
  );
}
