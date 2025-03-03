
import { useEffect } from "react";
import { JournalEntryForm } from "@/components/JournalEntryForm";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { mapDatabaseEntryToJournalEntry } from "@/types/journal";

const Journal = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    document.title = "Journal | Daily Driver";
  }, []);

  const { data: todayEntry, isLoading } = useQuery({
    queryKey: ["journal-entry", today],
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
      
      return data ? mapDatabaseEntryToJournalEntry(data) : null;
    },
    enabled: !!userId,
  });

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Daily Journal</h1>
        <p className="text-muted-foreground">
          Reflect on your day, capture your thoughts, and track your progress.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          {isLoading ? (
            <Card>
              <CardHeader>
                <CardTitle>Today's Journal</CardTitle>
              </CardHeader>
              <CardContent className="h-64 animate-pulse bg-gray-200 rounded-md"></CardContent>
            </Card>
          ) : todayEntry ? (
            <JournalEntryCard entry={todayEntry} showEdit={true} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Today's Journal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You haven't created a journal entry for today yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div>
          <JournalEntryForm existingEntry={todayEntry} />
        </div>
      </div>
    </div>
  );
};

export default Journal;
