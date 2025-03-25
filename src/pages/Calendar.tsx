import React, { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { fetchCalendarEntries } from "@/services/calendar/calendarService";
import { VerticalCalendar } from "@/components/calendar/VerticalCalendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addDays, subDays } from "date-fns";

const Calendar = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  // Calculate date range for fetching entries
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = today;
  const endDate = addDays(today, 90); // Fetch 3 months worth of entries

  // Fetch calendar entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["calendar", userId, startDate, endDate],
    queryFn: () => fetchCalendarEntries(userId!, startDate, endDate),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-[100px_1fr_1fr] gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
              <div className="grid grid-cols-[100px_1fr_1fr] gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
              <div className="grid grid-cols-[100px_1fr_1fr] gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <Card className="h-[calc(100vh-120px)]">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-70px)]">
          {userId && (
            <VerticalCalendar 
              entries={entries} 
              userId={userId}
              daysToShow={30} // Show 30 days by default
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar; 