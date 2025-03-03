
import React from "react";
import { Goal, GoalCategory, goalCategoryLabels } from "@/types/goals";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface GoalsListProps {
  goals: Goal[];
  editingGoal: Partial<Goal> | null;
  setEditingGoal: (goal: Partial<Goal> | null) => void;
  onUpdateGoal: () => void;
  onToggleComplete: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

const GoalsList = ({
  goals,
  editingGoal,
  setEditingGoal,
  onUpdateGoal,
  onToggleComplete,
  onDeleteGoal,
}: GoalsListProps) => {
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

  return (
    <>
      {Object.entries(categorizedGoals).map(([category, goals]) => (
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
                            <Button size="sm" onClick={onUpdateGoal}>
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
                              onClick={() => onToggleComplete(goal)}
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
                              onClick={() => onDeleteGoal(goal.id)}
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
      ))}
    </>
  );
};

export default GoalsList;
