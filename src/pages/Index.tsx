import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { useAuth } from "@/components/AuthProvider";
import { FeaturedGoal } from "@/components/FeaturedGoal";

const Index = () => {
  const { session } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    document.title = "Home | Daily Driver";
  }, []);

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
              <CardTitle className="text-lg">Daily Journal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Reflect on your day, capture your thoughts, and track your
                progress.
              </p>
              <Button asChild>
                <Link to="/journal">Open Journal</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Third column - Strava */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Strava Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Connect your Strava account to track your activities and fitness
                progress.
              </p>
              <Button asChild>
                <Link to="/strava">Connect Strava</Link>
              </Button>
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
