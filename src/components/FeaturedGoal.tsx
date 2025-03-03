
import { useQuery } from "@tanstack/react-query";
import { getFeaturedGoal } from "@/services/goalService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { goalCategoryLabels } from "@/types/goals";
import { Sparkles } from "lucide-react";
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
      <Card className="border-2 border-dashed border-primary/40 animate-pulse">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">Featured Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-12 bg-muted rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  if (!goal) {
    return (
      <Card className="border-2 border-dashed border-primary/40">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">Featured Goal</CardTitle>
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
    <Card className="border-2 border-blue-500/40 transition-all hover:border-blue-500/60">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span>Featured Goal</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-blue-600">
              {goalCategoryLabels[goal.category]}
            </span>
          </div>
          <p className="text-base">{goal.description}</p>
          <div className="flex justify-end mt-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/goals">View All Goals</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
