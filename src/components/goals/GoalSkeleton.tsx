
import React from "react";

const GoalSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-muted animate-pulse rounded-md"></div>
      <div className="h-24 bg-muted animate-pulse rounded-md"></div>
    </div>
  );
};

export default GoalSkeleton;
