
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getAllWeeklyIntentions } from "@/services/intentionService";
import { getCurrentWeekStart } from "@/types/intentions";

const Intentions = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const currentWeekStart = getCurrentWeekStart();

  useEffect(() => {
    document.title = "Weekly Intentions | Daily Driver";
  }, []);

  const { data: intentions, isLoading } = useQuery({
    queryKey: ["all-intentions", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await getAllWeeklyIntentions(userId);
    },
    enabled: !!userId,
  });

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Weekly Intentions</h1>
          <p className="text-muted-foreground">
            Set and reflect on your weekly intentions
          </p>
        </div>
        <Button asChild>
          <Link to="/intentions/edit">Set This Week's Intentions</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : intentions && intentions.length > 0 ? (
        <div className="space-y-6">
          {intentions.map((intention) => {
            const weekStartDate = new Date(intention.week_start);
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekEndDate.getDate() + 6);
            
            const isCurrentWeek = intention.week_start === currentWeekStart;
            
            return (
              <Card key={intention.id} className={isCurrentWeek ? "border-blue-400" : ""}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Week of {format(new Date(intention.week_start), "MMMM d, yyyy")}
                  </CardTitle>
                  <CardDescription>
                    {format(weekStartDate, "MMM d")} - {format(weekEndDate, "MMM d, yyyy")}
                    {isCurrentWeek && " (Current Week)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Intention 1:</h3>
                      <p className="text-sm">{intention.intention_1 || "Not set"}</p>
                      {intention.reflection_1 && (
                        <div className="mt-1">
                          <h4 className="text-sm font-medium text-muted-foreground">Reflection:</h4>
                          <p className="text-sm text-muted-foreground">{intention.reflection_1}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Intention 2:</h3>
                      <p className="text-sm">{intention.intention_2 || "Not set"}</p>
                      {intention.reflection_2 && (
                        <div className="mt-1">
                          <h4 className="text-sm font-medium text-muted-foreground">Reflection:</h4>
                          <p className="text-sm text-muted-foreground">{intention.reflection_2}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Intention 3:</h3>
                      <p className="text-sm">{intention.intention_3 || "Not set"}</p>
                      {intention.reflection_3 && (
                        <div className="mt-1">
                          <h4 className="text-sm font-medium text-muted-foreground">Reflection:</h4>
                          <p className="text-sm text-muted-foreground">{intention.reflection_3}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/intentions/edit/${intention.id}`}>
                          {isCurrentWeek ? "Edit" : "View Details"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No intentions yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You haven't set any weekly intentions yet. Start by setting your intentions for this week.
            </p>
            <Button asChild>
              <Link to="/intentions/edit">Set This Week's Intentions</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Intentions;
