
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import WeeklyIntentionsDisplay from "@/components/WeeklyIntentionsDisplay";
import { FeaturedGoal } from "@/components/FeaturedGoal";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const { session, loading } = useAuth();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Daily Driver";
  }, []);

  useEffect(() => {
    if (session?.user) {
      const email = session.user.email;
      const name = email ? email.split("@")[0] : "there";
      setUsername(name);
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome, {username || "Friend"}!</h1>
        <p className="text-muted-foreground text-lg">
          This is your personal dashboard for tracking your goals, journal entries,
          and fitness activities.
        </p>
      </div>

      <WeeklyIntentionsDisplay />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <FeaturedGoal />

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              className="h-24 flex flex-col items-center justify-center text-base p-3" 
              variant="outline"
              asChild
            >
              <Link to="/journal">
                <span className="text-2xl mb-1">📓</span>
                Daily Journal
              </Link>
            </Button>

            <Button 
              className="h-24 flex flex-col items-center justify-center text-base p-3" 
              variant="outline" 
              asChild
            >
              <Link to="/goals">
                <span className="text-2xl mb-1">🎯</span>
                Quarterly Goals
              </Link>
            </Button>

            <Button 
              className="h-24 flex flex-col items-center justify-center text-base p-3" 
              variant="outline"
              asChild
            >
              <Link to="/strava">
                <span className="text-2xl mb-1">🏃‍♂️</span>
                Strava Activities
              </Link>
            </Button>

            <Button 
              className="h-24 flex flex-col items-center justify-center text-base p-3" 
              variant="outline"
            >
              <span className="text-2xl mb-1">📊</span>
              Metrics
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" asChild>
            <Link to="/journal">Add Journal Entry</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/goals">Add New Goal</Link>
          </Button>
          <Button variant="outline">Track Mood</Button>
          <Button variant="outline">Add Note</Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
