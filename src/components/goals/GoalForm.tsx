
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalCategory, goalCategoryLabels } from "@/types/goals";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface GoalFormProps {
  quarterName: string;
  year: number;
  newGoal: {
    category: GoalCategory;
    description: string;
  };
  setNewGoal: React.Dispatch<
    React.SetStateAction<{
      category: GoalCategory;
      description: string;
    }>
  >;
  onAddGoal: () => void;
  isPending: boolean;
}

const GoalForm = ({
  quarterName,
  year,
  newGoal,
  setNewGoal,
  onAddGoal,
  isPending,
}: GoalFormProps) => {
  return (
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
            Set a new goal for the {quarterName} quarter of {year}
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
              <Button onClick={onAddGoal} disabled={isPending}>
                <Plus className="h-4 w-4 mr-1" /> Add Goal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GoalForm;
