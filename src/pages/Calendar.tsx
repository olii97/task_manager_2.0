import React, { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { fetchCalendarEntries } from "@/services/calendar/calendarService";
import { VerticalCalendar } from "@/components/calendar/VerticalCalendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addDays, subDays, addYears, subYears, format } from "date-fns";
import { CalendarIcon } from "lucide-react";

const Calendar = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  // Format today's date for display
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const formattedToday = format(today, "EEEE, MMMM d, yyyy");
  
  // Calculate date range for fetching entries (2 years back, 1 year forward)
  const startDate = subYears(today, 2); // 2 years ago
  const endDate = addYears(today, 1);   // 1 year ahead

  // Calculate total days to show in the calendar
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Fetch calendar entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["calendar", userId, startDate, endDate],
    queryFn: () => fetchCalendarEntries(userId!, startDate, endDate),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="container py-6">
        <Card className="h-[calc(100vh-120px)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Calendar</CardTitle>
              <div className="text-sm text-muted-foreground mt-1 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full mb-4" />
              <div className="grid grid-cols-[100px_1fr_1fr] border-b font-medium text-sm">
                <Skeleton className="h-8 mx-3" />
                <Skeleton className="h-8 mx-3" />
                <Skeleton className="h-8 mx-3" />
              </div>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[100px_1fr_1fr] border-b min-h-[130px]">
                  <div className="flex flex-col items-center justify-center border-r p-3">
                    <Skeleton className="h-8 w-8 mb-1 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="border-r p-3">
                    <Skeleton className="h-4 w-20 mb-4" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                  <div className="p-3">
                    <Skeleton className="h-4 w-20 mb-4" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <Card className="h-[calc(100vh-120px)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Calendar</CardTitle>
            <p className="text-sm text-muted-foreground mt-1 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {formattedToday}
            </p>
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-70px)]">
          {userId && (
            <VerticalCalendar 
              entries={entries} 
              userId={userId}
              startDate={startDate}
              endDate={endDate}
              daysToShow={totalDays}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar; 