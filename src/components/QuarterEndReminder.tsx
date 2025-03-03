
import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isQuarterEnd, getNextQuarter } from "@/services/goalService";

export const QuarterEndReminder = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if it's close to quarter end
    if (isQuarterEnd()) {
      const { quarter, year } = getNextQuarter();
      const quarterNames = ["First", "Second", "Third", "Fourth"];
      
      toast.message(
        `End of Quarter Approaching!`,
        {
          description: `It's time to review your current goals and set new ones for the ${quarterNames[quarter-1]} quarter of ${year}.`,
          action: {
            label: "Review Goals",
            onClick: () => navigate("/goals"),
          },
          duration: 10000, // 10 seconds
        }
      );
    }
  }, [navigate]);
  
  // This is a utility component that doesn't render anything
  return null;
};
