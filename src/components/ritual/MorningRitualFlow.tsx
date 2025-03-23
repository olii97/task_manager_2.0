
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'gratitude' | 'intentions' | 'journal';

interface MorningRitual {
  gratitude_items: string[];
  intentions: string[];
  journal_entry?: string;
  date: string;
}

// Create a type for the morning_rituals table that the Supabase client will understand
// This is a workaround since we can't modify the types.ts file
type MorningRitualTable = {
  id: string;
  user_id: string;
  gratitude_items: string[];
  intentions: string[];
  journal_entry?: string | null;
  date: string;
  created_at: string;
  updated_at: string;
};

export const MorningRitualFlow = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const userId = session?.user?.id;
  
  const [currentStep, setCurrentStep] = useState<Step>('gratitude');
  const [ritual, setRitual] = useState<MorningRitual>({
    gratitude_items: [''],
    intentions: [''],
    journal_entry: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddGratitudeItem = () => {
    setRitual(prev => ({
      ...prev,
      gratitude_items: [...prev.gratitude_items, '']
    }));
  };
  
  const handleRemoveGratitudeItem = (index: number) => {
    setRitual(prev => ({
      ...prev,
      gratitude_items: prev.gratitude_items.filter((_, i) => i !== index)
    }));
  };
  
  const handleGratitudeChange = (index: number, value: string) => {
    setRitual(prev => {
      const newItems = [...prev.gratitude_items];
      newItems[index] = value;
      return {
        ...prev,
        gratitude_items: newItems
      };
    });
  };
  
  const handleAddIntention = () => {
    setRitual(prev => ({
      ...prev,
      intentions: [...prev.intentions, '']
    }));
  };
  
  const handleRemoveIntention = (index: number) => {
    setRitual(prev => ({
      ...prev,
      intentions: prev.intentions.filter((_, i) => i !== index)
    }));
  };
  
  const handleIntentionChange = (index: number, value: string) => {
    setRitual(prev => {
      const newIntentions = [...prev.intentions];
      newIntentions[index] = value;
      return {
        ...prev,
        intentions: newIntentions
      };
    });
  };
  
  const handleJournalChange = (value: string) => {
    setRitual(prev => ({
      ...prev,
      journal_entry: value
    }));
  };
  
  const nextStep = () => {
    if (currentStep === 'gratitude') {
      // Filter out empty gratitude items
      const filteredGratitude = ritual.gratitude_items.filter(item => item.trim() !== '');
      if (filteredGratitude.length === 0) {
        toast({
          title: "Add at least one gratitude item",
          description: "Please share something you're grateful for",
          variant: "destructive"
        });
        return;
      }
      
      setRitual(prev => ({
        ...prev,
        gratitude_items: filteredGratitude
      }));
      setCurrentStep('intentions');
    } else if (currentStep === 'intentions') {
      // Filter out empty intentions
      const filteredIntentions = ritual.intentions.filter(item => item.trim() !== '');
      if (filteredIntentions.length === 0) {
        toast({
          title: "Add at least one intention",
          description: "Please share at least one intention for today",
          variant: "destructive"
        });
        return;
      }
      
      setRitual(prev => ({
        ...prev,
        intentions: filteredIntentions
      }));
      setCurrentStep('journal');
    }
  };
  
  const prevStep = () => {
    if (currentStep === 'intentions') {
      setCurrentStep('gratitude');
    } else if (currentStep === 'journal') {
      setCurrentStep('intentions');
    }
  };
  
  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "Authentication error",
        description: "Please sign in to save your morning ritual",
        variant: "destructive"
      });
      return;
    }
    
    // Filter out empty inputs
    const filteredGratitude = ritual.gratitude_items.filter(item => item.trim() !== '');
    const filteredIntentions = ritual.intentions.filter(item => item.trim() !== '');
    
    if (filteredGratitude.length === 0 || filteredIntentions.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add at least one gratitude item and one intention",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if an entry already exists for today
      const today = new Date().toISOString().split('T')[0];
      
      // Use type assertion to bypass TypeScript checking for the table name
      const { data: existingEntry, error: fetchError } = await supabase
        .from('morning_rituals' as any)
        .select('id')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Safely prepare journal entry field
      // Make sure to handle null or undefined values properly
      const journalEntry = ritual.journal_entry ? ritual.journal_entry.trim() : null;
      
      let result;
      
      if (existingEntry && existingEntry.id) {
        // Update existing entry
        result = await supabase
          .from('morning_rituals' as any)
          .update({
            gratitude_items: filteredGratitude,
            intentions: filteredIntentions,
            journal_entry: journalEntry
          })
          .eq('id', existingEntry.id);
      } else {
        // Insert new entry
        result = await supabase
          .from('morning_rituals' as any)
          .insert({
            user_id: userId,
            gratitude_items: filteredGratitude,
            intentions: filteredIntentions,
            journal_entry: journalEntry,
            date: today
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Morning ritual saved",
        description: "Your morning ritual has been saved successfully"
      });
      
      // Navigate to home page
      navigate('/');
      
    } catch (error) {
      console.error('Error saving morning ritual:', error);
      toast({
        title: "Error",
        description: "Failed to save your morning ritual",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Morning Ritual
      </h1>
      
      <AnimatePresence mode="wait">
        {currentStep === 'gratitude' && (
          <motion.div
            key="gratitude"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>What are you grateful for today?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ritual.gratitude_items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleGratitudeChange(index, e.target.value)}
                      placeholder={`I'm grateful for...`}
                      className="flex-1"
                    />
                    {ritual.gratitude_items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveGratitudeItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddGratitudeItem}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another
                </Button>
                
                <div className="flex justify-end pt-4">
                  <Button onClick={nextStep} className="flex items-center">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {currentStep === 'intentions' && (
          <motion.div
            key="intentions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>What are your intentions for today?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ritual.intentions.map((intention, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={intention}
                      onChange={(e) => handleIntentionChange(index, e.target.value)}
                      placeholder="Today, I intend to..."
                      className="flex-1"
                    />
                    {ritual.intentions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveIntention(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddIntention}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another
                </Button>
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={nextStep} className="flex items-center">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {currentStep === 'journal' && (
          <motion.div
            key="journal"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Journal Entry (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="journal">
                  Anything else on your mind this morning?
                </Label>
                <Textarea
                  id="journal"
                  value={ritual.journal_entry || ''}
                  onChange={(e) => handleJournalChange(e.target.value)}
                  placeholder="Write your thoughts here..."
                  className="min-h-[150px]"
                />
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="flex items-center"
                  >
                    {isSubmitting ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Complete Ritual
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
