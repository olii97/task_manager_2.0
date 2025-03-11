
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { getCurrentWeekIntentions, createWeeklyIntention } from "@/services/intentionService";
import { WeeklyIntention } from "@/types/intentions";
import { ClipboardList, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const WeeklyIntentionsCard = () => {
  const { session } = useAuth();
  const { toast } = useToast();
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
      toast({
        title: "Intentions created",
        description: "New weekly intentions have been created. You can now set your intentions for the week."
      });
      refetch();
    } catch (error) {
      console.error("Error creating empty intentions:", error);
      toast({
        title: "Error creating intentions",
        description: "There was a problem creating your weekly intentions. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-teal-500" />
            <span>Weekly Intentions</span>
          </CardTitle>
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
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-teal-500" />
            <span>Weekly Intentions</span>
          </CardTitle>
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
    <Card className="bg-gradient-to-br from-card to-teal-50 dark:from-card dark:to-teal-950/20 border-teal-200 dark:border-teal-900 shadow-md hover:shadow-lg transition-all h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-teal-500" />
          <span>Weekly Intentions</span>
        </CardTitle>
        <Button asChild variant="ghost" size="sm" className="gap-1 hover:bg-teal-100 dark:hover:bg-teal-900">
          <Link to="/intentions">
            View All
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-1">
        {!weeklyIntentions ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">You haven't set any intentions for this week.</p>
            <Button onClick={handleCreateEmptyIntentions} className="bg-teal-600 hover:bg-teal-700" size="sm">Set Intentions</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {weeklyIntentions.intention_1 ? (
              <div className="bg-white dark:bg-gray-800 rounded-md p-2 border border-teal-100 dark:border-teal-900">
                <p className="text-xs font-medium flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" />
                  <span>{weeklyIntentions.intention_1}</span>
                </p>
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-md p-2 border border-dashed border-teal-200 dark:border-teal-800">
                <p className="text-xs text-muted-foreground">No first intention set</p>
              </div>
            )}
            
            {weeklyIntentions.intention_2 ? (
              <div className="bg-white dark:bg-gray-800 rounded-md p-2 border border-teal-100 dark:border-teal-900">
                <p className="text-xs font-medium flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" />
                  <span>{weeklyIntentions.intention_2}</span>
                </p>
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-md p-2 border border-dashed border-teal-200 dark:border-teal-800">
                <p className="text-xs text-muted-foreground">No second intention set</p>
              </div>
            )}
            
            {weeklyIntentions.intention_3 ? (
              <div className="bg-white dark:bg-gray-800 rounded-md p-2 border border-teal-100 dark:border-teal-900">
                <p className="text-xs font-medium flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" />
                  <span>{weeklyIntentions.intention_3}</span>
                </p>
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-md p-2 border border-dashed border-teal-200 dark:border-teal-800">
                <p className="text-xs text-muted-foreground">No third intention set</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button asChild variant="outline" size="sm" className="hover:bg-teal-100 dark:hover:bg-teal-900">
                <Link to={`/intentions/edit/${weeklyIntentions.id}`}>Edit Intentions</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
