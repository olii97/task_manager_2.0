
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyGoalsStateProps {
  onAddGoal: () => void;
  label?: string;
  description?: string;
  buttonText?: string;
}

const EmptyGoalsState = ({
  onAddGoal,
  label = "No goals set for this quarter",
  description = "Start by adding goals to track for the current quarter",
  buttonText = "Add Your First Goal",
}: EmptyGoalsStateProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-6">
          <h3 className="text-lg font-medium mb-2">{label}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <Button onClick={onAddGoal}>
            <Plus className="h-4 w-4 mr-1" /> {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyGoalsState;
