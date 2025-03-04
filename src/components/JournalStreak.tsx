
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy } from "lucide-react";
import { calculateStreakAndXP } from "@/types/streaks";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

export function JournalStreak() {
  const { session } = useAuth();
  const userId = session?.user.id;
  
  const { data: streakData, isLoading } = useQuery({
    queryKey: ["journal-streaks", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("date")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      
      if (error) {
        console.error("Error fetching streak data:", error);
        throw error;
      }
      
      return calculateStreakAndXP(data || []);
    },
    enabled: !!userId,
  });
  
  // Check if user has journaled today
  const { data: todayEntry } = useQuery({
    queryKey: ["journal-today-check"],
    queryFn: async () => {
      if (!userId) return null;
      
      const today = format(new Date(), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error checking today's entry:", error);
        throw error;
      }
      
      return !!data;
    },
    enabled: !!userId,
  });
  
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6 h-32"></CardContent>
      </Card>
    );
  }
  
  if (!streakData) return null;
  
  // Calculate progress to next milestone (for XP progress bar)
  const milestones = [100, 250, 500, 1000, 2500, 5000, 10000];
  const currentXP = streakData.xp_points;
  
  let nextMilestone = milestones.find(m => m > currentXP) || currentXP * 2;
  let prevMilestone = milestones.findIndex(m => m > currentXP) > 0 
    ? milestones[milestones.findIndex(m => m > currentXP) - 1] 
    : 0;
  
  const progressPercentage = ((currentXP - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Journal Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-xl font-bold flex items-baseline gap-1">
                {streakData.current_streak}
                <span className="text-sm font-normal text-muted-foreground">days</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
              <p className="text-xl font-bold flex items-baseline gap-1">
                {streakData.longest_streak}
                <span className="text-sm font-normal text-muted-foreground">days</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <svg className="h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="text-xl font-bold flex items-baseline gap-1">
                {streakData.xp_points}
                <span className="text-sm font-normal text-muted-foreground">XP</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{prevMilestone} XP</span>
            <span>{nextMilestone} XP</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-center mt-1 text-muted-foreground">
            {nextMilestone - currentXP} XP until next milestone
          </p>
        </div>
        
        {!todayEntry && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
            <p className="text-blue-800">
              📝 You haven't journaled today yet. Record your thoughts to maintain your streak!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
