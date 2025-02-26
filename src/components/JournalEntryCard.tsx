
import { formatRelative } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MoodOptions = ["😢", "😕", "😐", "🙂", "😊"];
const EnergyOptions = ["Very Low", "Low", "Moderate", "High", "Very High"];

interface JournalEntry {
  id: string;
  date: string;
  mood: number;
  energy: number;
  intentions: string;
  gratitude: string;
  challenges: string;
  reflection: string;
  nutrition: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string;
    water?: number;
  };
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface Props {
  entry: JournalEntry;
}

export function JournalEntryCard({ entry }: Props) {
  const moodEmoji = MoodOptions[entry.mood - 1];
  const energyLevel = EnergyOptions[entry.energy - 1];
  const formattedDate = formatRelative(new Date(entry.date), new Date());

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <time className="text-sm text-muted-foreground">{formattedDate}</time>
            <div className="flex gap-2">
              <Badge variant="outline">{moodEmoji}</Badge>
              <Badge variant="outline">{energyLevel}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <section>
              <h3 className="font-medium">Intentions</h3>
              <p className="text-sm text-muted-foreground">{entry.intentions}</p>
            </section>

            <section>
              <h3 className="font-medium">Gratitude</h3>
              <p className="text-sm text-muted-foreground">{entry.gratitude}</p>
            </section>

            <section>
              <h3 className="font-medium">Challenges</h3>
              <p className="text-sm text-muted-foreground">{entry.challenges}</p>
            </section>

            <section>
              <h3 className="font-medium">Reflection</h3>
              <p className="text-sm text-muted-foreground">{entry.reflection}</p>
            </section>

            {entry.nutrition && (
              <section>
                <h3 className="font-medium">Nutrition</h3>
                <div className="grid gap-1 text-sm text-muted-foreground">
                  {entry.nutrition.breakfast && (
                    <p>Breakfast: {entry.nutrition.breakfast}</p>
                  )}
                  {entry.nutrition.lunch && <p>Lunch: {entry.nutrition.lunch}</p>}
                  {entry.nutrition.dinner && (
                    <p>Dinner: {entry.nutrition.dinner}</p>
                  )}
                  {entry.nutrition.snacks && (
                    <p>Snacks: {entry.nutrition.snacks}</p>
                  )}
                  {entry.nutrition.water && (
                    <p>Water intake: {entry.nutrition.water} glasses</p>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
