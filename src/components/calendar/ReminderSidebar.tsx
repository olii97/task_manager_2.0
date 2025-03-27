import React from "react";
import { CalendarEntry, getDaysRemaining } from "@/services/calendar/calendarService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellRing, Briefcase, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReminderSidebarProps {
  reminders: CalendarEntry[];
}

export function ReminderSidebar({ reminders }: ReminderSidebarProps) {
  // Sort reminders by closest due date first
  const sortedReminders = [...reminders].sort((a, b) => {
    const daysA = getDaysRemaining(a);
    const daysB = getDaysRemaining(b);
    return daysA - daysB;
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <BellRing className="mr-2 h-5 w-5 text-amber-500" />
          Upcoming Reminders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedReminders.length === 0 ? (
          <p className="text-muted-foreground text-sm">No upcoming reminders</p>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_80px] font-medium text-sm mb-2 border-b pb-1">
              <div>Task</div>
              <div className="text-right">Days Left</div>
            </div>
            {sortedReminders.map((reminder) => {
              const daysRemaining = getDaysRemaining(reminder);
              
              // Determine urgency level
              let urgencyClass = "text-green-600 bg-green-50";
              if (daysRemaining <= 1) {
                urgencyClass = "text-red-600 bg-red-50";
              } else if (daysRemaining <= 3) {
                urgencyClass = "text-amber-600 bg-amber-50";
              } else if (daysRemaining <= 7) {
                urgencyClass = "text-blue-600 bg-blue-50";
              }
              
              return (
                <div 
                  key={reminder.id} 
                  className="grid grid-cols-[1fr_80px] py-2 text-sm border-b last:border-none items-center"
                >
                  <div className="flex items-center">
                    {reminder.entry_type === 'work' ? (
                      <Briefcase className="h-3.5 w-3.5 mr-2 text-blue-600" />
                    ) : (
                      <User className="h-3.5 w-3.5 mr-2 text-purple-600" />
                    )}
                    <div className="truncate">
                      {reminder.title}
                      {reminder.reminder_days_before && (
                        <span className="text-xs ml-2 text-muted-foreground">
                          (Remind {reminder.reminder_days_before} days before)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn("font-medium", urgencyClass)}>
                      {daysRemaining === 0 ? "Today" : daysRemaining === 1 ? "Tomorrow" : `${daysRemaining} days`}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 