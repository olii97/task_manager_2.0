
import { JournalEntry, getMoodEmoji, getEnergyLabel, ReflectionEntry } from "@/types/journal";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

interface JournalEntryDetailProps {
  entry: JournalEntry;
}

export function JournalEntryDetail({ entry }: JournalEntryDetailProps) {
  const moodEmoji = getMoodEmoji(entry.mood);
  const energyLevel = getEnergyLabel(entry.energy);
  const formattedDate = format(new Date(entry.date), "MMMM d, yyyy");
  
  // Process reflections
  const reflections: ReflectionEntry[] = entry.reflections || 
    (entry.reflection ? [{ timestamp: entry.created_at, content: entry.reflection }] : []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md">{formattedDate}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-base">{moodEmoji}</Badge>
              <Badge variant="outline">{energyLevel}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {reflections && reflections.length > 0 && (
            <section>
              <h3 className="font-medium mb-3">Reflections</h3>
              <div className="space-y-4">
                {reflections.map((reflection, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(reflection.timestamp), "h:mm a")}
                    </p>
                    <p className="whitespace-pre-wrap">{reflection.content}</p>
                    {index < reflections.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {entry.intentions && (
            <section>
              <h3 className="font-medium mb-1">Intentions</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{entry.intentions}</p>
            </section>
          )}
          
          {entry.gratitude && (
            <section>
              <h3 className="font-medium mb-1">Gratitude</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{entry.gratitude}</p>
            </section>
          )}
          
          {entry.challenges && (
            <section>
              <h3 className="font-medium mb-1">Challenges</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{entry.challenges}</p>
            </section>
          )}
          
          {entry.nutrition && Object.values(entry.nutrition).some(val => val) && (
            <section>
              <h3 className="font-medium mb-1">Nutrition</h3>
              <div className="grid gap-1 text-sm text-muted-foreground">
                {entry.nutrition.breakfast && <p>Breakfast: {entry.nutrition.breakfast}</p>}
                {entry.nutrition.lunch && <p>Lunch: {entry.nutrition.lunch}</p>}
                {entry.nutrition.dinner && <p>Dinner: {entry.nutrition.dinner}</p>}
                {entry.nutrition.snacks && <p>Snacks: {entry.nutrition.snacks}</p>}
                {entry.nutrition.water && <p>Water intake: {entry.nutrition.water} glasses</p>}
                {entry.nutrition.meals && <p>Meals: {entry.nutrition.meals}</p>}
                {entry.nutrition.calories && <p>Calories: {entry.nutrition.calories}</p>}
                {entry.nutrition.feelings && <p>Feelings: {entry.nutrition.feelings}</p>}
                {entry.nutrition.protein !== undefined && (
                  <p>Protein goal met: {entry.nutrition.protein ? 'Yes' : 'No'}</p>
                )}
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
