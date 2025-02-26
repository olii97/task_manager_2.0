
import { Button } from "@/components/ui/button";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { JournalEntryForm } from "@/components/JournalEntryForm";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showForm, setShowForm] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Daily Journal</h1>
          <p className="mt-2 text-muted-foreground">
            Record your daily reflections and track your wellness journey
          </p>
        </div>

        <div className="mb-8">
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
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

        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-semibold">Recent Entries</h2>
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
      </main>
    </div>
  );
};

export default Index;
