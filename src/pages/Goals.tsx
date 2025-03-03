
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentQuarterGoals, createGoal, updateGoal, deleteGoal, getCurrentQuarter, getNextQuarter } from "@/services/goalService";
import { Goal, GoalCategory, goalCategoryLabels } from "@/types/goals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Edit, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

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

  const renderGoalsByCategory = (goals: Goal[]) => {
    const categorizedGoals: Record<GoalCategory, Goal[]> = {
      spiritual: [],
      physical_health: [],
      mental_health: [],
      financial: [],
      philanthropy: [],
      knowledge_culture: [],
      friends_family: [],
      work: [],
    };

    goals.forEach((goal) => {
      categorizedGoals[goal.category].push(goal);
    });

    return Object.entries(categorizedGoals).map(([category, goals]) => (
      <div key={category} className="mb-6">
        <h3 className="font-medium text-lg mb-3">{goalCategoryLabels[category as GoalCategory]}</h3>
        {goals.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">No goals set</p>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative"
              >
                {editingGoal && editingGoal.id === goal.id ? (
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <Select
                          value={editingGoal.category}
                          onValueChange={(value) =>
                            setEditingGoal({ ...editingGoal, category: value as GoalCategory })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(goalCategoryLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Textarea
                          value={editingGoal.description}
                          onChange={(e) =>
                            setEditingGoal({ ...editingGoal, description: e.target.value })
                          }
                          className="resize-none"
                          placeholder="Goal description"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingGoal(null)}
                          >
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                          <Button size="sm" onClick={handleUpdateGoal}>
                            <Check className="h-4 w-4 mr-1" /> Save
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className={goal.isCompleted ? "border-green-500/50 bg-green-50/30" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`${goal.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                            {goal.description}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleComplete(goal)}
                            title={goal.isCompleted ? "Mark as incomplete" : "Mark as complete"}
                            className={goal.isCompleted ? "text-green-600" : ""}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingGoal(goal)}
                            title="Edit goal"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteGoal(goal.id)}
                            title="Delete goal"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    ));
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
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Add New Goal</CardTitle>
                  <CardDescription>
                    Set a new goal for the {selectedTab === "current" 
                      ? `${currentQuarterName} quarter of ${currentQuarter.year}` 
                      : `${nextQuarterName} quarter of ${nextQuarter.year}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={newGoal.category}
                        onValueChange={(value) =>
                          setNewGoal({ ...newGoal, category: value as GoalCategory })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(goalCategoryLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                        placeholder="What do you want to achieve this quarter?"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleAddGoal} disabled={createMutation.isPending}>
                        <Plus className="h-4 w-4 mr-1" /> Add Goal
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
              <div className="space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded-md"></div>
                <div className="h-24 bg-muted animate-pulse rounded-md"></div>
              </div>
            ) : currentGoals.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-6">
                    <h3 className="text-lg font-medium mb-2">No goals set for this quarter</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding goals to track for the current quarter
                    </p>
                    <Button onClick={() => setIsAddingGoal(true)}>
                      <Plus className="h-4 w-4 mr-1" /> Add Your First Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              renderGoalsByCategory(currentGoals)
            )}
          </TabsContent>

          <TabsContent value="next" className="space-y-4">
            {isLoadingNext ? (
              <div className="space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded-md"></div>
                <div className="h-24 bg-muted animate-pulse rounded-md"></div>
              </div>
            ) : nextGoals.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-6">
                    <h3 className="text-lg font-medium mb-2">Plan ahead</h3>
                    <p className="text-muted-foreground mb-4">
                      Set goals for the upcoming quarter to stay ahead
                    </p>
                    <Button onClick={() => setIsAddingGoal(true)}>
                      <Plus className="h-4 w-4 mr-1" /> Add Future Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              renderGoalsByCategory(nextGoals)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Goals;
