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
    <Card>
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
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_100px] font-medium text-sm mb-4">
              <div>Task</div>
              <div className="text-right">Days Left</div>
            </div>
            <div className="space-y-2">
              {sortedReminders.map(reminder => {
                const daysRemaining = getDaysRemaining(reminder);
                const reminderText = reminder.reminder_days_before 
                  ? `(Remind ${reminder.reminder_days_before} days before)`
                  : '';
                
                return (
                  <div 
                    key={reminder.id} 
                    className="grid grid-cols-[1fr_100px] items-center py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {reminder.entry_type === 'work' ? (
                        <Briefcase className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      ) : (
                        <User className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="font-medium">{reminder.title}</span>
                        {reminderText && (
                          <span className="text-sm text-muted-foreground ml-2">
                            {reminderText}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "font-medium px-2 py-0.5",
                          daysRemaining <= 1 ? "text-red-600 bg-red-50" :
                          daysRemaining <= 3 ? "text-amber-600 bg-amber-50" :
                          daysRemaining <= 7 ? "text-blue-600 bg-blue-50" :
                          "text-green-600 bg-green-50"
                        )}
                      >
                        {daysRemaining === 0 ? "Today" : 
                         daysRemaining === 1 ? "Tomorrow" : 
                         `${daysRemaining} days`}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 