
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { useAuth } from "@/components/AuthProvider";
import { FeaturedGoal } from "@/components/FeaturedGoal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { StravaActivityList } from "@/components/StravaActivityList";
import { getStravaActivities, isConnectedToStrava } from "@/services/stravaService";

const Index = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [date, setDate] = useState<Date | undefined>(new Date());
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    document.title = "Home | Daily Driver";
  }, []);

  // Fetch today's journal entry
  const { data: todayEntry, isLoading: isLoadingJournal } = useQuery({
    queryKey: ["today-journal-entry", today, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching journal entry:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!userId,
  });

  // Check if connected to Strava
  const { data: isConnected } = useQuery({
    queryKey: ["strava-connected", userId],
    queryFn: () => isConnectedToStrava(userId!),
    enabled: !!userId,
  });

  // Fetch Strava activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["strava-activities", userId],
    queryFn: () => getStravaActivities(userId!),
    enabled: !!userId && !!isConnected,
  });

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">
          Welcome, {session?.user.email}!
        </h1>
        <p className="text-muted-foreground">
          Here's a snapshot of your day and goals.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* First column - Featured Goal */}
        <div className="space-y-6">
          <FeaturedGoal />
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center justify-between p-2">
                <h2 className="text-sm font-semibold">
                  {format(date || new Date(), "MMMM yyyy")}
                </h2>
              </div>
              <DayPicker
                mode="single"
                selected={date}
                onSelect={setDate}
                footer={
                  date ? (
                    <p>
                      You picked{" "}
                      {format(date, "PP")}
                      .
                    </p>
                  ) : (
                    <span>Please pick a date.</span>
                  )
                }
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Second column - Journal */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Today's Journal</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingJournal ? (
                <div className="h-24 bg-muted animate-pulse rounded-md"></div>
              ) : todayEntry ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Mood: {todayEntry.mood}/10
                    </span>
                    <span className="text-sm font-medium">
                      Energy: {todayEntry.energy}/10
                    </span>
                  </div>
                  {todayEntry.reflection && (
                    <p className="text-sm line-clamp-3">{todayEntry.reflection}</p>
                  )}
                  <div className="flex justify-end">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/journal">View Full Journal</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground mb-2">
                    You haven't logged your journal entry for today.
                  </p>
                  <Button asChild>
                    <Link to="/journal">Add Journal Entry</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Strava Link */}
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Strava Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {isConnected 
                  ? "Your Strava account is connected. View all your activities." 
                  : "Connect your Strava account to track your activities and fitness progress."}
              </p>
              <Button asChild>
                <Link to="/strava">
                  {isConnected ? "View Activities" : "Connect Strava"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Third column - Strava Activities */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {isConnected ? (
                <StravaActivityList 
                  activities={activities?.slice(0, 5) || []} 
                  isLoading={isLoadingActivities}
                  compact={true} 
                />
              ) : (
                <p className="text-muted-foreground">
                  Connect your Strava account to see your recent activities here.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">
            Overview
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">898</div>
          <p className="text-sm text-muted-foreground">
            Insights and summary data will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
