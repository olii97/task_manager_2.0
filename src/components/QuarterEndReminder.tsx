import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isQuarterEnd, getNextQuarter } from "@/services/goalService";
import { useAuth } from "@/components/AuthProvider";

export const QuarterEndReminder = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  
  useEffect(() => {
    if (!session?.user) return;

    // Check if reminder has been dismissed
    const reminderDismissed = localStorage.getItem('quarterEndReminderDismissed');
    if (reminderDismissed) return;

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
          onDismiss: () => {
            // Store dismissal in localStorage
            localStorage.setItem('quarterEndReminderDismissed', 'true');
          }
        }
      );
    }
  }, [navigate, session]);
  
  // This is a utility component that doesn't render anything
  return null;
};
