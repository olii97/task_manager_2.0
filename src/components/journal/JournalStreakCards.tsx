
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy } from "lucide-react";
import { UserStreak } from "@/types/streaks";

interface JournalStreakCardsProps {
  streakData: UserStreak;
}

export function JournalStreakCards({ streakData }: JournalStreakCardsProps) {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Flame className="h-4 w-4 text-orange-500 mr-2" />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{streakData.current_streak}</span>
            <span className="ml-2 text-muted-foreground">days</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
            Longest Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{streakData.longest_streak}</span>
            <span className="ml-2 text-muted-foreground">days</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <svg className="h-4 w-4 text-purple-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
            </svg>
            Experience Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{streakData.xp_points}</span>
            <span className="ml-2 text-muted-foreground">XP</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
