import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useDashboardSettings } from "@/hooks/useDashboardSettings";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
  titleRightContent?: ReactNode;
}

export function DashboardCard({ id, title, children, className, titleRightContent }: DashboardCardProps) {
  const { isTileHidden, toggleTileVisibility } = useDashboardSettings();
  const hidden = isTileHidden(id);

  return (
    <Card className={cn("dashboard-card transition-all duration-300", 
      hidden ? "h-[60px] overflow-hidden" : "", 
      className
    )}>
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          {titleRightContent}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => toggleTileVisibility(id)}
            title={hidden ? "Show card" : "Hide card"}
          >
            {hidden ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={hidden ? "hidden" : ""}>
        {children}
      </CardContent>
    </Card>
  );
} 