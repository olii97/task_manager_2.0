
import React from "react";

export function TasksLoadingState() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
