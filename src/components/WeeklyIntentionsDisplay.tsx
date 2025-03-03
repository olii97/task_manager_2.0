
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { WeeklyIntention } from "@/types/weeklyIntentions";
import { canEditIntentions, getCurrentWeekIntentions, shouldShowReflection } from "@/services/weeklyIntentionService";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import WeeklyIntentionsForm from "./WeeklyIntentionsForm";

export function WeeklyIntentionsDisplay() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [showReflection, setShowReflection] = useState(true);

  const { data: weeklyIntentions, isLoading, error, refetch } = useQuery({
    queryKey: ["weekly-intentions"],
    queryFn: async () => {
      if (!userId) return null;
      try {
        return await getCurrentWeekIntentions(userId);
      } catch (err) {
        console.error("Error fetching weekly intentions:", err);
        return null;
      }
    },
    enabled: !!userId,
  });

  useEffect(() => {
    const checkEditPermission = async () => {
      try {
        const editAllowed = await canEditIntentions();
        setCanEdit(editAllowed);
        
        const showReflectionButton = await shouldShowReflection();
        setShowReflection(showReflectionButton);
      } catch (err) {
        console.error("Error checking permissions:", err);
        // Default to allowing edits if there's an error
        setCanEdit(true);
        setShowReflection(true);
      }
    };
    
    checkEditPermission();
  }, []);

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleIntentionsUpdated = () => {
    setIsEditing(false);
    refetch();
  };

  if (error) {
    console.error("Error in WeeklyIntentionsDisplay:", error);
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Intentions for This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading weekly intentions. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Intentions for This Week</CardTitle>
        </CardHeader>
        <CardContent className="h-32 animate-pulse bg-gray-200 rounded-md"></CardContent>
      </Card>
    );
  }

  // If in editing mode, show the form
  if (isEditing) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Intentions for This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyIntentionsForm 
            existingIntentions={weeklyIntentions} 
            onCancel={handleCancelEdit}
            onSuccess={handleIntentionsUpdated}
          />
        </CardContent>
      </Card>
    );
  }

  // If no intentions exist yet, show the form
  if (!weeklyIntentions) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Set Your Intentions for This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyIntentionsForm 
            onSuccess={handleIntentionsUpdated}
            onCancel={() => {}}
          />
        </CardContent>
      </Card>
    );
  }

  // Display existing intentions
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Intentions for This Week</CardTitle>
        {canEdit && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={handleStartEditing}
          >
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2 items-start">
            <div className="mt-1 text-xl">💡</div>
            <div className="flex-1">
              <p className="text-blue-700 font-medium">Intention 1</p>
              <p>{weeklyIntentions.intention_1 || "Not set"}</p>
            </div>
          </div>
          
          <div className="flex gap-2 items-start">
            <div className="mt-1 text-xl">💡</div>
            <div className="flex-1">
              <p className="text-blue-700 font-medium">Intention 2</p>
              <p>{weeklyIntentions.intention_2 || "Not set"}</p>
            </div>
          </div>
          
          <div className="flex gap-2 items-start">
            <div className="mt-1 text-xl">💡</div>
            <div className="flex-1">
              <p className="text-blue-700 font-medium">Intention 3</p>
              <p>{weeklyIntentions.intention_3 || "Not set"}</p>
            </div>
          </div>

          {showReflection && (
            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                asChild
              >
                <Link to="/weekly-reflection">
                  <CheckCircle className="h-4 w-4" />
                  Review Your Week
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default WeeklyIntentionsDisplay;
