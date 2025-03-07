
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { wrapupDay } from "@/services/wrapupService";

interface WrapUpDayButtonProps {
  userId?: string;
}

export const WrapUpDayButton: React.FC<WrapUpDayButtonProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleWrapUp = async () => {
    if (!userId) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to wrap up your day.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await wrapupDay(userId);
      toast({
        title: "Day wrapped up successfully!",
        description: "Your daily summary has been generated and is ready for download.",
      });
    } catch (error) {
      console.error("Error wrapping up day:", error);
      toast({
        title: "Error",
        description: "Failed to wrap up your day. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleWrapUp} 
      disabled={isLoading || !userId}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Wrap Up My Day"
      )}
    </Button>
  );
};
