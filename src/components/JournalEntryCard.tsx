
import { formatRelative } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { JournalEntry, getMoodEmoji, getEnergyLabel } from "@/types/journal";

interface Props {
  entry: JournalEntry;
  onEdit?: () => void;
}

export function JournalEntryCard({ entry, onEdit }: Props) {
  const moodEmoji = getMoodEmoji(entry.mood);
  const energyLevel = getEnergyLabel(entry.energy);
  const formattedDate = formatRelative(new Date(entry.date), new Date());

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <time className="text-sm text-muted-foreground">{formattedDate}</time>
            <div className="flex gap-2 items-center">
              <Badge variant="outline">{moodEmoji}</Badge>
              <Badge variant="outline">{energyLevel}</Badge>
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onEdit} 
                  className="ml-2 h-8 w-8 p-0"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
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
                  {entry.nutrition.meals && (
                    <p>Meals: {entry.nutrition.meals}</p>
                  )}
                  {entry.nutrition.calories && (
                    <p>Calories: {entry.nutrition.calories}</p>
                  )}
                  {entry.nutrition.feelings && (
                    <p>Feelings: {entry.nutrition.feelings}</p>
                  )}
                  {entry.nutrition.protein !== undefined && (
                    <p>Protein goal met: {entry.nutrition.protein ? 'Yes' : 'No'}</p>
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
