
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

const MoodOptions = ["😔", "😐", "🙂", "😊", "😃"] as const;

export const JournalEntryForm = () => {
  const { toast } = useToast();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    toast({
      title: "Journal Entry Saved",
      description: "Your reflection has been recorded successfully.",
    });
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

        <Button
          type="submit"
          className="w-full"
        >
          Save Journal Entry
        </Button>
      </form>
    </motion.div>
  );
};
