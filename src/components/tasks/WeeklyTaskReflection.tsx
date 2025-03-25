import React, { useState } from "react";
import { Task } from "@/types/tasks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, Calendar } from "lucide-react";
import { supabase } from "@/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/hooks/use-toast";

interface WeeklyTaskReflectionProps {
  open: boolean;
  onClose: () => void;
  completedTasks: Task[];
}

export function WeeklyTaskReflection({ open, onClose, completedTasks }: WeeklyTaskReflectionProps) {
  const { session } = useAuth();
  const [reflectionText, setReflectionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleSaveReflection = async () => {
    if (!session?.user.id || !reflectionText.trim()) return;

    setIsSubmitting(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: session.user.id,
          date: today.toISOString().split('T')[0],
          entry_type: 'weekly_task_reflection',
          reflection: reflectionText.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Reflection saved",
        description: "Your weekly task reflection has been saved.",
      });

      onClose();
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast({
        title: "Error",
        description: "Failed to save your reflection",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetAIInsights = async () => {
    if (!completedTasks.length) return;

    setIsLoadingAI(true);
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        toast({
          title: "OpenAI API Key Not Found",
          description: "The OpenAI API key is not configured in the environment.",
          variant: "destructive"
        });
        return;
      }

      const taskList = completedTasks
        .map(task => `- ${task.title} (${task.priority})`)
        .join('\n');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that provides insights and reflections on completed tasks. Focus on patterns, achievements, and areas for improvement."
            },
            {
              role: "user",
              content: `Here are the tasks I completed this week:\n\n${taskList}\n\nPlease provide a thoughtful reflection on these completed tasks, focusing on patterns, achievements, and potential areas for improvement.`
            }
          ]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        setAiResponse(data.choices[0].message.content);
      }
    } catch (error) {
      console.error('Error getting AI insights:', error);
      toast({
        title: "Error",
        description: "Failed to get AI insights",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center text-xl">
            <Calendar className="h-5 w-5 mr-2" />
            Weekly Task Reflection
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="tasks">Completed Tasks</TabsTrigger>
            <TabsTrigger value="reflection">Your Reflection</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {completedTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No tasks completed this week.
              </p>
            ) : (
              completedTasks.map((task) => (
                <Card key={task.id} className="shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Completed on {new Date(task.completion_date!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="reflection" className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Reflect on your completed tasks this week..."
                className="min-h-[150px] resize-none"
              />
            </div>

            {aiResponse && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2 text-sm">AI Insights</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {aiResponse}
                </p>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetAIInsights}
                disabled={isLoadingAI || !completedTasks.length}
              >
                {isLoadingAI ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Getting Insights...
                  </>
                ) : (
                  "Get AI Insights"
                )}
              </Button>
              <Button size="sm" onClick={handleSaveReflection} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Reflection"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 