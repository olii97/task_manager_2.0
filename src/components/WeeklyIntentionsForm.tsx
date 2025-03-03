
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthProvider";
import { WeeklyIntention, WeeklyIntentionFormData } from "@/types/weeklyIntentions";
import { createWeeklyIntentions, updateWeeklyIntentions } from "@/services/weeklyIntentionService";
import { toast } from "sonner";

const formSchema = z.object({
  intention_1: z.string().min(3, "Intention must be at least 3 characters"),
  intention_2: z.string().min(3, "Intention must be at least 3 characters"),
  intention_3: z.string().min(3, "Intention must be at least 3 characters"),
});

interface WeeklyIntentionsFormProps {
  existingIntentions?: WeeklyIntention | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function WeeklyIntentionsForm({ existingIntentions, onSuccess, onCancel }: WeeklyIntentionsFormProps) {
  const { session } = useAuth();
  const userId = session?.user.id;

  const form = useForm<WeeklyIntentionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      intention_1: existingIntentions?.intention_1 || "",
      intention_2: existingIntentions?.intention_2 || "",
      intention_3: existingIntentions?.intention_3 || "",
    },
  });

  const onSubmit = async (data: WeeklyIntentionFormData) => {
    if (!userId) {
      toast.error("You need to be logged in to save intentions");
      return;
    }

    try {
      if (existingIntentions) {
        await updateWeeklyIntentions(existingIntentions.id, data);
        toast.success("Weekly intentions updated successfully");
      } else {
        await createWeeklyIntentions(userId, data);
        toast.success("Weekly intentions created successfully");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving weekly intentions:", error);
      toast.error("Failed to save weekly intentions");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="intention_1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intention 1</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What is your first intention for this week?" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="intention_2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intention 2</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What is your second intention for this week?" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="intention_3"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intention 3</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What is your third intention for this week?" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {existingIntentions && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {existingIntentions ? "Update Intentions" : "Set Intentions"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default WeeklyIntentionsForm;
