
import { Button } from "@/components/ui/button";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { JournalEntryForm } from "@/components/JournalEntryForm";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

// Sample data - in a real app, this would come from your backend
const sampleEntries = [
  {
    id: "1",
    date: new Date(),
    mood: 4,
    energy: 3,
    intentions: "Complete my project tasks and go for a run",
    gratitude: "Grateful for my family and good health",
    challenges: "Managing work-life balance",
    reflection: "Had a productive day despite some obstacles",
    nutrition: {
      meals: "Oatmeal for breakfast, Salad for lunch",
      feelings: "Energized and satisfied",
      calories: 1800,
      protein: 80,
    },
  },
  {
    id: "2",
    date: new Date(Date.now() - 86400000), // Yesterday
    mood: 5,
    energy: 4,
    intentions: "Meditate and work on personal projects",
    gratitude: "Beautiful weather and supportive friends",
    challenges: "Staying focused during meetings",
    reflection: "Great day overall with lots of accomplishments",
    nutrition: {
      meals: "Smoothie bowl, Grilled chicken with veggies",
      feelings: "Light and energetic",
      calories: 2000,
      protein: 95,
    },
  },
];

const Index = () => {
  const [showForm, setShowForm] = useState(false);

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
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
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
            {sampleEntries.map((entry) => (
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
        </div>
      </main>
    </div>
  );
};

export default Index;
