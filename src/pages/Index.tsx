
import { Button } from "@/components/ui/button";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { JournalEntryForm } from "@/components/JournalEntryForm";
import { StravaActivities } from "@/components/StravaActivities";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChatBot } from "@/components/ChatBot";
import type { Database } from "@/integrations/supabase/types";

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const { data: entries, isLoading } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error("Error logging out: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold tracking-tight text-blue-700">Daily Journal</h1>
            <p className="mt-2 text-muted-foreground">
              Record your daily reflections and track your wellness journey
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr,auto] gap-8">
          <div className="space-y-8">
            <div>
              <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                {showForm ? "Close Form" : "New Entry"}
              </Button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <JournalEntryForm />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-blue-600">Recent Entries</h2>
              {isLoading ? (
                <p>Loading entries...</p>
              ) : (
                <motion.div
                  className="grid gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                >
                  {entries?.map((entry) => (
                    <motion.div
                      key={entry.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                    >
                      <JournalEntryCard entry={entry} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
          
          <div className="space-y-8">
            <StravaActivities />
          </div>

          <div>
            <ChatBot />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
