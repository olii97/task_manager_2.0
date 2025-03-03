
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentQuarterGoals, createGoal, updateGoal, deleteGoal, getCurrentQuarter, getNextQuarter, getGoalsForQuarter } from "@/services/goalService";
import { Goal, GoalCategory } from "@/types/goals";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { AnimatePresence } from "framer-motion";
import GoalsList from "@/components/goals/GoalsList";
import EmptyGoalsState from "@/components/goals/EmptyGoalsState";
import GoalForm from "@/components/goals/GoalForm";
import GoalSkeleton from "@/components/goals/GoalSkeleton";

const Goals = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<"current" | "next">("current");
  const [editingGoal, setEditingGoal] = useState<Partial<Goal> | null>(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<{
    category: GoalCategory;
    description: string;
  }>({
    category: "spiritual",
    description: "",
  });

  const currentQuarter = getCurrentQuarter();
  const nextQuarter = getNextQuarter();

  const { data: currentGoals = [], isLoading: isLoadingCurrent } = useQuery({
    queryKey: ["goals", currentQuarter.quarter, currentQuarter.year],
    queryFn: () => getCurrentQuarterGoals(),
    enabled: !!session,
  });

  const { data: nextGoals = [], isLoading: isLoadingNext } = useQuery({
    queryKey: ["goals", nextQuarter.quarter, nextQuarter.year],
    queryFn: () => getGoalsForQuarter(nextQuarter.quarter, nextQuarter.year),
    enabled: !!session,
  });

  const createMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["featured-goal"] });
      toast.success("Goal created successfully");
      setIsAddingGoal(false);
      setNewGoal({ category: "spiritual", description: "" });
    },
    onError: (error: any) => {
      toast.error("Failed to create goal", {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) => 
      updateGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["featured-goal"] });
      toast.success("Goal updated successfully");
      setEditingGoal(null);
    },
    onError: (error: any) => {
      toast.error("Failed to update goal", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["featured-goal"] });
      toast.success("Goal deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete goal", {
        description: error.message,
      });
    },
  });

  const handleAddGoal = () => {
    if (!newGoal.description.trim()) {
      toast.error("Please enter a goal description");
      return;
    }

    const quarter = selectedTab === "current" ? currentQuarter.quarter : nextQuarter.quarter;
    const year = selectedTab === "current" ? currentQuarter.year : nextQuarter.year;

    createMutation.mutate({
      user_id: session!.user.id,
      category: newGoal.category,
      description: newGoal.description.trim(),
      isCompleted: false,
      quarter,
      year,
    });
  };

  const handleUpdateGoal = () => {
    if (!editingGoal || !editingGoal.id) return;
    if (!editingGoal.description?.trim()) {
      toast.error("Please enter a goal description");
      return;
    }

    updateMutation.mutate({
      id: editingGoal.id,
      updates: {
        category: editingGoal.category as GoalCategory,
        description: editingGoal.description.trim(),
        isCompleted: editingGoal.isCompleted,
      },
    });
  };

  const handleDeleteGoal = (goalId: string) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      deleteMutation.mutate(goalId);
    }
  };

  const handleToggleComplete = (goal: Goal) => {
    updateMutation.mutate({
      id: goal.id,
      updates: {
        isCompleted: !goal.isCompleted,
      },
    });
  };

  const quarterNames = ["First", "Second", "Third", "Fourth"];
  const currentQuarterName = quarterNames[currentQuarter.quarter - 1];
  const nextQuarterName = quarterNames[nextQuarter.quarter - 1];

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">Quarterly Goals</h1>
          <Button
            onClick={() => {
              setIsAddingGoal(!isAddingGoal);
              setNewGoal({ category: "spiritual", description: "" });
            }}
          >
            {isAddingGoal ? "Cancel" : "Add Goal"}
          </Button>
        </div>

        <AnimatePresence>
          {isAddingGoal && (
            <GoalForm
              quarterName={selectedTab === "current" ? currentQuarterName : nextQuarterName}
              year={selectedTab === "current" ? currentQuarter.year : nextQuarter.year}
              newGoal={newGoal}
              setNewGoal={setNewGoal}
              onAddGoal={handleAddGoal}
              isPending={createMutation.isPending}
            />
          )}
        </AnimatePresence>

        <Tabs
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as "current" | "next")}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="current">
              {currentQuarterName} Quarter {currentQuarter.year}
            </TabsTrigger>
            <TabsTrigger value="next">
              {nextQuarterName} Quarter {nextQuarter.year}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {isLoadingCurrent ? (
              <GoalSkeleton />
            ) : currentGoals.length === 0 ? (
              <EmptyGoalsState onAddGoal={() => setIsAddingGoal(true)} />
            ) : (
              <GoalsList
                goals={currentGoals}
                editingGoal={editingGoal}
                setEditingGoal={setEditingGoal}
                onUpdateGoal={handleUpdateGoal}
                onToggleComplete={handleToggleComplete}
                onDeleteGoal={handleDeleteGoal}
              />
            )}
          </TabsContent>

          <TabsContent value="next" className="space-y-4">
            {isLoadingNext ? (
              <GoalSkeleton />
            ) : nextGoals.length === 0 ? (
              <EmptyGoalsState 
                onAddGoal={() => setIsAddingGoal(true)}
                label="Plan ahead"
                description="Set goals for the upcoming quarter to stay ahead"
                buttonText="Add Future Goal"
              />
            ) : (
              <GoalsList
                goals={nextGoals}
                editingGoal={editingGoal}
                setEditingGoal={setEditingGoal}
                onUpdateGoal={handleUpdateGoal}
                onToggleComplete={handleToggleComplete}
                onDeleteGoal={handleDeleteGoal}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Goals;
