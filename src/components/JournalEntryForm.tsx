import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JournalEntry, ReflectionEntry, JournalNutrition, scaleToSlider, sliderToScale, getMoodEmoji, getEnergyLabel } from "@/types/journal";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  date: z.string(),
  mood: z.number().min(1).max(5),
  energy: z.number().min(1).max(5),
  reflection: z.string().optional(),
  gratitude: z.string().optional(),
  challenges: z.string().optional(),
  intentions: z.string().optional(),
  nutrition_breakfast: z.string().optional(),
  nutrition_lunch: z.string().optional(),
  nutrition_dinner: z.string().optional(),
  nutrition_snacks: z.string().optional(),
  nutrition_water: z.string().optional(),
  nutrition_feelings: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface JournalEntryFormProps {
  userId: string;
  entry?: JournalEntry | null;
  onCancel: () => void;
  onSave: () => void;
}

export function JournalEntryForm({ userId, entry, onCancel, onSave }: JournalEntryFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moodValue, setMoodValue] = useState(scaleToSlider(entry?.mood || 3));
  const [energyValue, setEnergyValue] = useState(scaleToSlider(entry?.energy || 3));

  const today = format(new Date(), "yyyy-MM-dd");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: entry?.date || today,
      mood: entry?.mood || 3,
      energy: entry?.energy || 3,
      reflection: entry?.reflection || "",
      gratitude: entry?.gratitude || "",
      challenges: entry?.challenges || "",
      intentions: entry?.intentions || "",
      nutrition_breakfast: entry?.nutrition?.breakfast || "",
      nutrition_lunch: entry?.nutrition?.lunch || "",
      nutrition_dinner: entry?.nutrition?.dinner || "",
      nutrition_snacks: entry?.nutrition?.snacks || "",
      nutrition_water: entry?.nutrition?.water?.toString() || "",
      nutrition_feelings: entry?.nutrition?.feelings || "",
    },
  });

  useEffect(() => {
    // Update form values when entry changes
    if (entry) {
      form.reset({
        date: entry.date,
        mood: entry.mood,
        energy: entry.energy,
        reflection: entry.reflection || "",
        gratitude: entry.gratitude || "",
        challenges: entry.challenges || "",
        intentions: entry.intentions || "",
        nutrition_breakfast: entry.nutrition?.breakfast || "",
        nutrition_lunch: entry.nutrition?.lunch || "",
        nutrition_dinner: entry.nutrition?.dinner || "",
        nutrition_snacks: entry.nutrition?.snacks || "",
        nutrition_water: entry.nutrition?.water?.toString() || "",
        nutrition_feelings: entry.nutrition?.feelings || "",
      });
      setMoodValue(scaleToSlider(entry.mood));
      setEnergyValue(scaleToSlider(entry.energy));
    }
  }, [entry, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const timestamp = new Date().toISOString();
      
      // Format nutrition data
      const nutrition: JournalNutrition = {
        breakfast: data.nutrition_breakfast || undefined,
        lunch: data.nutrition_lunch || undefined,
        dinner: data.nutrition_dinner || undefined,
        snacks: data.nutrition_snacks || undefined,
        water: data.nutrition_water ? parseInt(data.nutrition_water) : undefined,
        feelings: data.nutrition_feelings || undefined,
      };

      // Prepare reflection data
      const newReflectionContent = data.reflection?.trim();
      let reflections: ReflectionEntry[] | null = null;
      
      // If we have existing reflections, use those
      if (entry?.reflections && entry.reflections.length > 0) {
        reflections = [...entry.reflections];
        
        // Only add a new reflection if content is provided and it's different from the last one
        if (newReflectionContent && 
            (reflections.length === 0 || 
             reflections[reflections.length - 1].content !== newReflectionContent)) {
          reflections.push({
            timestamp,
            content: newReflectionContent
          });
        }
      } 
      // Otherwise, create a new reflections array if we have content
      else if (newReflectionContent) {
        reflections = [{
          timestamp,
          content: newReflectionContent
        }];
      }

      if (entry) {
        // Update existing entry
        const { error } = await supabase
          .from("journal_entries")
          .update({
            date: data.date,
            mood: data.mood,
            energy: data.energy,
            reflection: data.reflection || null,
            reflections: reflections,
            gratitude: data.gratitude || null,
            challenges: data.challenges || null,
            intentions: data.intentions || null,
            nutrition: Object.keys(nutrition).length > 0 ? nutrition : null,
            updated_at: timestamp,
          })
          .eq("id", entry.id)
          .eq("user_id", userId);

        if (error) throw error;

        toast({
          title: "Entry Updated",
          description: "Your journal entry has been updated successfully",
        });
      } else {
        // Create new entry
        const { error } = await supabase.from("journal_entries").insert({
          user_id: userId,
          date: data.date,
          mood: data.mood,
          energy: data.energy,
          reflection: data.reflection || null,
          reflections: reflections,
          gratitude: data.gratitude || null,
          challenges: data.challenges || null,
          intentions: data.intentions || null,
          nutrition: Object.keys(nutrition).length > 0 ? nutrition : null,
        });

        if (error) throw error;

        toast({
          title: "Entry Created",
          description: "Your journal entry has been created successfully",
        });
      }

      onSave();
      navigate("/journal");
    } catch (error: any) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save journal entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mood: {getMoodEmoji(field.value)} {field.value}/5</FormLabel>
                    <FormControl>
                      <Slider
                        value={[moodValue]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => {
                          const scaledValue = sliderToScale(value[0]);
                          setMoodValue(value[0]);
                          field.onChange(scaledValue);
                        }}
                      />
                    </FormControl>
                    <FormDescription>How did you feel today?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="energy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Energy: {getEnergyLabel(field.value)} {field.value}/5</FormLabel>
                    <FormControl>
                      <Slider
                        value={[energyValue]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => {
                          const scaledValue = sliderToScale(value[0]);
                          setEnergyValue(value[0]);
                          field.onChange(scaledValue);
                        }}
                      />
                    </FormControl>
                    <FormDescription>How was your energy level today?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reflection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reflection</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What happened today? How do you feel about it?" 
                      className="min-h-[200px] resize-y" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Write about your day, thoughts, feelings, and experiences.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gratitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gratitude</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What are you grateful for today?" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="challenges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenges</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What challenges did you face today?" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intentions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intentions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What are your intentions for tomorrow?" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="nutrition">
                <AccordionTrigger>Nutrition</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nutrition_breakfast"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Breakfast</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What did you have for breakfast?" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutrition_lunch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lunch</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What did you have for lunch?" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutrition_dinner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dinner</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What did you have for dinner?" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutrition_snacks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Snacks</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What snacks did you have?" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutrition_water"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Water (glasses)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="How many glasses of water did you drink?" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutrition_feelings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How did you feel about your eating today?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Were you satisfied with your nutrition today?" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : entry ? "Update Entry" : "Create Entry"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
