import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { JournalStreak } from "@/components/JournalStreak";

const Index = () => {
  const { session } = useAuth();

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <JournalStreak />

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Jump straight into your daily tasks.</p>
            <Button asChild>
              <Link to="/journal">Write in Journal</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/intentions">Set Weekly Intentions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>User ID: {session?.user.id}</p>
            <p>Email: {session?.user.email}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
