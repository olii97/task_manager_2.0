
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { getCurrentWeekIntentions, submitWeeklyReflections } from "@/services/weeklyIntentionService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { WeeklyReflectionFormData } from "@/types/weeklyIntentions";

export function WeeklyReflection() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const navigate = useNavigate();
  const [reflections, setReflections] = useState<WeeklyReflectionFormData>({
    reflection_1: "",
    reflection_2: "",
    reflection_3: ""
  });

  useEffect(() => {
    document.title = "Weekly Reflection | Daily Driver";
  }, []);

  const { data: weeklyIntentions, isLoading } = useQuery({
    queryKey: ["weekly-intentions"],
    queryFn: async () => {
      if (!userId) return null;
      return getCurrentWeekIntentions(userId);
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (weeklyIntentions) {
      setReflections({
        reflection_1: weeklyIntentions.reflection_1 || "",
        reflection_2: weeklyIntentions.reflection_2 || "",
        reflection_3: weeklyIntentions.reflection_3 || ""
      });
    }
  }, [weeklyIntentions]);

  const handleInputChange = (field: keyof WeeklyReflectionFormData, value: string) => {
    setReflections(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !weeklyIntentions) {
      toast.error("No active intentions found for this week");
      return;
    }
    
    try {
      await submitWeeklyReflections(weeklyIntentions.id, reflections);
      toast.success("Weekly reflections submitted successfully");
      navigate("/");
    } catch (error) {
      console.error("Error submitting reflections:", error);
      toast.error("Failed to submit reflections");
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Loading your intentions...</CardTitle>
          </CardHeader>
          <CardContent className="h-64 animate-pulse bg-gray-200 rounded-md"></CardContent>
        </Card>
      </div>
    );
  }

  if (!weeklyIntentions) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No Active Weekly Intentions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              You don't have any active intentions for this week.
            </p>
            <div className="flex justify-center">
              <Button onClick={() => navigate("/")}>Return to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weekStartDate = new Date(weeklyIntentions.week_start);
  const formattedWeekStart = format(weekStartDate, "MMMM d, yyyy");

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-blue-700">
            Weekly Reflection: Week of {formattedWeekStart}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <span className="text-xl">💡</span> 
                  Intention 1
                </h3>
                <p className="text-blue-700 font-medium pl-8">
                  {weeklyIntentions.intention_1 || "Not set"}
                </p>
                <div className="pl-8">
                  <label 
                    htmlFor="reflection_1" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Reflection
                  </label>
                  <Textarea
                    id="reflection_1"
                    placeholder="Reflect on how you did with this intention..."
                    rows={3}
                    value={reflections.reflection_1}
                    onChange={(e) => handleInputChange("reflection_1", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <span className="text-xl">💡</span> 
                  Intention 2
                </h3>
                <p className="text-blue-700 font-medium pl-8">
                  {weeklyIntentions.intention_2 || "Not set"}
                </p>
                <div className="pl-8">
                  <label 
                    htmlFor="reflection_2" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Reflection
                  </label>
                  <Textarea
                    id="reflection_2"
                    placeholder="Reflect on how you did with this intention..."
                    rows={3}
                    value={reflections.reflection_2}
                    onChange={(e) => handleInputChange("reflection_2", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <span className="text-xl">💡</span> 
                  Intention 3
                </h3>
                <p className="text-blue-700 font-medium pl-8">
                  {weeklyIntentions.intention_3 || "Not set"}
                </p>
                <div className="pl-8">
                  <label 
                    htmlFor="reflection_3" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Reflection
                  </label>
                  <Textarea
                    id="reflection_3"
                    placeholder="Reflect on how you did with this intention..."
                    rows={3}
                    value={reflections.reflection_3}
                    onChange={(e) => handleInputChange("reflection_3", e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button type="submit">
                Submit & Archive Week
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default WeeklyReflection;
