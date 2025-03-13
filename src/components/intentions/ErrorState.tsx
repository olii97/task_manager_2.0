
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const IntentionsErrorState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            There was a problem loading your intentions. Please try again.
          </p>
          <Button onClick={() => navigate("/intentions")}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
