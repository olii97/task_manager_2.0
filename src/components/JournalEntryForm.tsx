
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntry } from "@/types/journal";

const MoodOptions = ["😔", "😐", "🙂", "😊", "😃"] as const;

interface JournalEntryFormProps {
  existingEntry?: JournalEntry;
  onCancel?: () => void;
}

export const JournalEntryForm = ({ existingEntry, onCancel }: JournalEntryFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mood, setMood] = useState<(typeof MoodOptions)[number]>("🙂");
  const [energyLevel, setEnergyLevel] = useState(50);
  const [form, setForm] = useState({
    intentions: "",
    gratefulness: "",
    challenges: "",
    reflection: "",
    nutrition: {
      meals: "",
      feelings: "",
      calories: "",
      proteinTarget: false,
    },
  });

  // Initialize form with existing entry data if provided
  useEffect(() => {
    if (existingEntry) {
      // Set mood based on existing entry
      setMood(MoodOptions[existingEntry.mood - 1] || "🙂");
      
      // Set energy level based on existing entry (convert from 1-5 scale to 0-100)
      setEnergyLevel(existingEntry.energy * 20);
      
      // Set form values
      setForm({
        intentions: existingEntry.intentions || "",
        gratefulness: existingEntry.gratitude || "",
        challenges: existingEntry.challenges || "",
        reflection: existingEntry.reflection || "",
        nutrition: {
          meals: existingEntry.nutrition?.meals || "",
          feelings: existingEntry.nutrition?.feelings || "",
          calories: existingEntry.nutrition?.calories?.toString() || "",
          proteinTarget: existingEntry.nutrition?.protein || false,
        },
      });
    }
  }, [existingEntry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const entryData = {
        user_id: session?.user.id,
        date: existingEntry?.date || new Date().toISOString().split('T')[0],
        mood: MoodOptions.indexOf(mood) + 1,
        energy: Math.round(energyLevel / 20),
        intentions: form.intentions,
        gratitude: form.gratefulness,
        challenges: form.challenges,
        reflection: form.reflection,
        nutrition: {
          meals: form.nutrition.meals,
          feelings: form.nutrition.feelings,
          calories: parseInt(form.nutrition.calories) || 0,
          protein: form.nutrition.proteinTarget,
        },
      };

      let error;

      if (existingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from("journal_entries")
          .update(entryData)
          .eq("id", existingEntry.id);
        error = updateError;
      } else {
        // Insert new entry
        const { error: insertError } = await supabase
          .from("journal_entries")
          .insert(entryData);
        error = insertError;
      }

      if (error) throw error;

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast({
        title: existingEntry ? "Journal Entry Updated" : "Journal Entry Saved",
        description: existingEntry 
          ? "Your journal entry has been updated successfully." 
          : "Your reflection has been recorded successfully.",
      });

      // If editing, call onCancel to go back to view mode
      if (existingEntry && onCancel) {
        onCancel();
      } else {
        // Navigate back to home if creating a new entry
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>How are you feeling today?</Label>
              <div className="flex justify-between gap-2">
                {MoodOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMood(option)}
                    className={`text-2xl p-2 rounded-full transition-all ${
                      mood === option
                        ? "bg-primary/10 scale-110"
                        : "hover:bg-primary/5"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Energy Level</Label>
              <Slider
                value={[energyLevel]}
                onValueChange={([value]) => setEnergyLevel(value)}
                max={100}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intentions">Today's Intentions</Label>
              <Textarea
                id="intentions"
                value={form.intentions}
                onChange={(e) =>
                  setForm({ ...form, intentions: e.target.value })
                }
                placeholder="What do you want to accomplish today?"
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gratefulness">Gratitude</Label>
              <Textarea
                id="gratefulness"
                value={form.gratefulness}
                onChange={(e) =>
                  setForm({ ...form, gratefulness: e.target.value })
                }
                placeholder="What are you grateful for today?"
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenges">Challenges</Label>
              <Textarea
                id="challenges"
                value={form.challenges}
                onChange={(e) =>
                  setForm({ ...form, challenges: e.target.value })
                }
                placeholder="What challenges did you face?"
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reflection">Daily Reflection</Label>
              <Textarea
                id="reflection"
                value={form.reflection}
                onChange={(e) =>
                  setForm({ ...form, reflection: e.target.value })
                }
                placeholder="Reflect on your day..."
                className="resize-none"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Nutrition Tracking</h3>
              
              <div className="space-y-2">
                <Label htmlFor="meals">Meals</Label>
                <Textarea
                  id="meals"
                  value={form.nutrition.meals}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nutrition: { ...form.nutrition, meals: e.target.value },
                    })
                  }
                  placeholder="What did you eat today?"
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feelings">How did you feel after eating?</Label>
                <Textarea
                  id="feelings"
                  value={form.nutrition.feelings}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nutrition: { ...form.nutrition, feelings: e.target.value },
                    })
                  }
                  placeholder="Describe how you felt after your meals..."
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calories">Estimated Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={form.nutrition.calories}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nutrition: { ...form.nutrition, calories: e.target.value },
                    })
                  }
                  placeholder="Enter estimated calories"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="proteinTarget"
                  checked={form.nutrition.proteinTarget}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nutrition: {
                        ...form.nutrition,
                        proteinTarget: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="proteinTarget">Hit protein target for today</Label>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-between space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          )}
          <Button type="submit" className="w-full">
            {existingEntry ? "Update Journal Entry" : "Save Journal Entry"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
