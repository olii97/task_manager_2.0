
import { useQuery } from "@tanstack/react-query";
import { getFeaturedGoal } from "@/services/goalService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { goalCategoryLabels } from "@/types/goals";
import { Sparkles, Target, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const FeaturedGoal = () => {
  const { data: goal, isLoading } = useQuery({
    queryKey: ["featured-goal"],
    queryFn: getFeaturedGoal,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading) {
    return (
      <Card className="border-2 border-dashed border-primary/40 animate-pulse h-full">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span>Featured Goal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-12 bg-muted rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  if (!goal) {
    return (
      <Card className="border-2 border-dashed border-primary/40 h-full">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span>Featured Goal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">You haven't set any goals for this quarter yet.</p>
          <Button asChild>
            <Link to="/goals">Set Quarterly Goals</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-blue-50 dark:from-card dark:to-blue-950/20 border-blue-200 dark:border-blue-900 shadow-md hover:shadow-lg transition-all h-full">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span>Featured Goal</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {goalCategoryLabels[goal.category]}
          </div>
          <p className="text-base font-medium">{goal.description}</p>
          <div className="flex justify-end mt-2">
            <Button asChild variant="ghost" size="sm" className="gap-1 hover:bg-blue-100 dark:hover:bg-blue-900">
              <Link to="/goals">
                View All Goals
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
