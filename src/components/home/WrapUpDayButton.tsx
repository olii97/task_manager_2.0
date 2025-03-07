
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { generateDailyWrapup, downloadWrapupAsJson } from "@/services/wrapupService";

interface WrapUpDayButtonProps {
  userId: string | undefined;
}

export const WrapUpDayButton = ({ userId }: WrapUpDayButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleWrapUpDay = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You need to be logged in to wrap up your day.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate daily wrap-up data
      const wrapupData = await generateDailyWrapup(userId);
      
      // Download the data as JSON
      downloadWrapupAsJson(wrapupData);
      
      toast({
        title: "Day Wrapped Up!",
        description: "Your daily summary has been downloaded as a JSON file.",
      });
    } catch (error) {
      console.error("Error generating daily wrap-up:", error);
      toast({
        title: "Error",
        description: "Failed to generate daily wrap-up.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleWrapUpDay} 
      disabled={isLoading || !userId}
      variant="outline"
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Wrap Up My Day
        </>
      )}
    </Button>
  );
};
