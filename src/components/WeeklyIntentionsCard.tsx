
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { getCurrentWeekIntentions, createWeeklyIntention } from "@/services/intentionService";
import { WeeklyIntention } from "@/types/intentions";

export const WeeklyIntentionsCard = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  const { 
    data: weeklyIntentions, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ["weekly-intentions", userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        return await getCurrentWeekIntentions(userId);
      } catch (error) {
        console.error("Error fetching weekly intentions:", error);
        return null;
      }
    },
    enabled: !!userId,
  });

  const handleCreateEmptyIntentions = async () => {
    if (!userId) return;
    
    try {
      await createWeeklyIntention(userId, {});
      refetch();
    } catch (error) {
      console.error("Error creating empty intentions:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Intentions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Intentions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Error loading weekly intentions.</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Weekly Intentions</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/intentions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!weeklyIntentions ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">You haven't set any intentions for this week.</p>
            <Button onClick={handleCreateEmptyIntentions}>Set Intentions</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {weeklyIntentions.intention_1 ? (
              <div>
                <p className="text-sm font-medium">1. {weeklyIntentions.intention_1}</p>
                {weeklyIntentions.reflection_1 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Reflection: {weeklyIntentions.reflection_1}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No first intention set</p>
            )}
            
            {weeklyIntentions.intention_2 ? (
              <div>
                <p className="text-sm font-medium">2. {weeklyIntentions.intention_2}</p>
                {weeklyIntentions.reflection_2 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Reflection: {weeklyIntentions.reflection_2}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No second intention set</p>
            )}
            
            {weeklyIntentions.intention_3 ? (
              <div>
                <p className="text-sm font-medium">3. {weeklyIntentions.intention_3}</p>
                {weeklyIntentions.reflection_3 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Reflection: {weeklyIntentions.reflection_3}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No third intention set</p>
            )}
            
            <div className="flex justify-end">
              <Button asChild variant="outline" size="sm">
                <Link to={`/intentions/edit/${weeklyIntentions.id}`}>Edit Intentions</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
