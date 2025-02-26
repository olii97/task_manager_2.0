
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";

interface JournalEntry {
  id: string;
  date: Date;
  mood: number;
  energy: number;
  intentions: string;
  gratitude: string;
  challenges: string;
  reflection: string;
  nutrition: {
    meals: string;
    feelings: string;
    calories: number;
    protein: number;
  };
}

export const JournalEntryCard = ({ entry }: { entry: JournalEntry }) => {
  const getMoodEmoji = (mood: number) => {
    const emojis = ["😢", "😕", "😐", "🙂", "😊"];
    return emojis[mood - 1] || "😐";
  };

  const getEnergyEmoji = (energy: number) => {
    const emojis = ["🔋", "🔋🔋", "🔋🔋🔋", "🔋🔋🔋🔋", "🔋🔋🔋🔋🔋"];
    return emojis[energy - 1] || "🔋🔋🔋";
  };

  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold">
            {format(new Date(entry.date), "MMMM d, yyyy")}
          </h3>
          <div className="flex gap-4 text-muted-foreground">
            <span title="Mood">
              {getMoodEmoji(entry.mood)} {entry.mood}/5
            </span>
            <span title="Energy">
              {getEnergyEmoji(entry.energy)} {entry.energy}/5
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {entry.intentions && (
          <div>
            <h4 className="mb-2 font-medium">Today's Intentions</h4>
            <p className="text-muted-foreground">{entry.intentions}</p>
          </div>
        )}
        {entry.gratitude && (
          <div>
            <h4 className="mb-2 font-medium">Gratitude</h4>
            <p className="text-muted-foreground">{entry.gratitude}</p>
          </div>
        )}
        {entry.challenges && (
          <div>
            <h4 className="mb-2 font-medium">Challenges</h4>
            <p className="text-muted-foreground">{entry.challenges}</p>
          </div>
        )}
        {entry.reflection && (
          <div>
            <h4 className="mb-2 font-medium">Reflection</h4>
            <p className="text-muted-foreground">{entry.reflection}</p>
          </div>
        )}
        {entry.nutrition && (
          <div>
            <h4 className="mb-2 font-medium">Nutrition</h4>
            <div className="space-y-2">
              <p className="text-muted-foreground">Meals: {entry.nutrition.meals}</p>
              <p className="text-muted-foreground">Feelings: {entry.nutrition.feelings}</p>
              <div className="flex gap-4 text-muted-foreground">
                <span>Calories: {entry.nutrition.calories}</span>
                <span>Protein: {entry.nutrition.protein}g</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
