import React from 'react';
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isQuarterEnd, getNextQuarter } from "@/services/goalService";
import { useAuth } from "@/components/AuthProvider";

export const QuarterEndReminder: React.FC = () => {
  // Disable the reminder by returning null
  return null;
};
