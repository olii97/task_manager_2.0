import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { JournalStreak } from "@/components/JournalStreak";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapDatabaseEntryToJournalEntry, getMoodEmoji } from "@/types/journal";
import { format } from "date-fns";
import { FeaturedGoal } from "@/components/FeaturedGoal";
import { PenLine, Plus } from "lucide-react";
import { WeeklyIntentionsCard } from "@/components/WeeklyIntentionsCard";
import { StravaActivityList } from "@/components/StravaActivityList";
import { fetchStravaActivities } from "@/services/stravaService";

const Index = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch today's journal entry
  const { data: todayEntry, isLoading: isJournalLoading } = useQuery({
    queryKey: ["journal-entry", today],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching journal entry:", error);
        throw error;
      }
      
      return data ? mapDatabaseEntryToJournalEntry(data) : null;
    },
    enabled: !!userId,
  });

  // Fetch recent Strava activities
  const { data: stravaActivities, isLoading: isStravaLoading } = useQuery({
    queryKey: ["strava-activities", userId, "recent"],
    queryFn: async () => {
      if (!userId) return [];
      const { activities, error } = await fetchStravaActivities(userId);
      if (error) {
        console.error("Error fetching Strava activities:", error);
        return [];
      }
      return activities.slice(0, 5); // Get only the 5 most recent activities
    },
    enabled: !!userId,
  });

  return (
    <div className="container py-6">
      {/* Weekly Intentions at the top */}
      <div className="mb-6">
        <WeeklyIntentionsCard />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <JournalStreak />

        {/* Today's Journal Entry or Add Button */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Journal</CardTitle>
          </CardHeader>
          <CardContent>
            {isJournalLoading ? (
              <div className="h-24 bg-muted animate-pulse rounded-md"></div>
            ) : todayEntry ? (
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{todayEntry.mood ? getMoodEmoji(todayEntry.mood) : "😐"}</span>
                  <p className="text-sm text-muted-foreground">
                    Mood: {todayEntry.mood}/5 • Energy: {todayEntry.energy}/5
                  </p>
                </div>
                {todayEntry.reflection && (
                  <p className="text-sm line-clamp-3 mt-2">{todayEntry.reflection}</p>
                )}
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/journal">
                      <PenLine className="h-4 w-4 mr-1" /> View Full Entry
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-muted-foreground">You haven't journaled today yet.</p>
                <Button asChild>
                  <Link to="/journal">
                    <Plus className="h-4 w-4 mr-1" /> Add Journal Entry
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Featured Goal */}
        <FeaturedGoal />
      </div>

      {/* Strava Activities */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Strava Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <StravaActivityList 
              activities={stravaActivities || []} 
              isLoading={isStravaLoading}
              compact={true}
            />
            {stravaActivities && stravaActivities.length > 0 && (
              <div className="mt-4 text-right">
                <Button asChild variant="outline" size="sm">
                  <Link to="/strava">View All Activities</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
