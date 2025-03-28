import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Check } from 'lucide-react';

// Steps for the ritual flow
type Step = 'greeting' | 'gratitude' | 'intentions' | 'journal';

// Interface for ritual data
interface RitualData {
  gratitude_items: string[];
  intentions: string[];
  journal_entry?: string;
  date: string;
}

export const MeditationRitual = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const userId = session?.user?.id;
  const sunrise = useRef<any>(null);

  // State management
  const [currentStep, setCurrentStep] = useState<Step>('greeting');
  const [ritualData, setRitualData] = useState<RitualData>({
    gratitude_items: ['', '', ''],
    intentions: ['', '', ''],
    journal_entry: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0); // 0 to 100

  // Start sunrise animation on component mount
  useEffect(() => {
    // Total animation duration: 180 seconds (3 minutes)
    const totalDuration = 180000;
    const startTime = Date.now();
    
    // Animation loop
    const animateSunrise = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1) * 100;
      
      setAnimationProgress(progress);
      
      if (progress < 100) {
        sunrise.current = requestAnimationFrame(animateSunrise);
      }
    };
    
    sunrise.current = requestAnimationFrame(animateSunrise);
    
    // Cleanup animation on unmount
    return () => {
      if (sunrise.current) {
        cancelAnimationFrame(sunrise.current);
      }
    };
  }, []);
  
  // Handle automatic transitions
  useEffect(() => {
    if (currentStep === 'greeting') {
      const timer = setTimeout(() => {
        setCurrentStep('gratitude');
        setShowInputs(false);
      }, 4000); // 4 second delay
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Show inputs with delay
  useEffect(() => {
    if (currentStep === 'gratitude' || currentStep === 'intentions' || currentStep === 'journal') {
      const timer = setTimeout(() => {
        setShowInputs(true);
      }, 1000); // 1 second delay
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Handle gratitude item changes
  const handleGratitudeChange = (index: number, value: string) => {
    setRitualData(prev => {
      const newItems = [...prev.gratitude_items];
      newItems[index] = value;
      return {
        ...prev,
        gratitude_items: newItems
      };
    });
  };

  // Handle intention changes
  const handleIntentionChange = (index: number, value: string) => {
    setRitualData(prev => {
      const newIntentions = [...prev.intentions];
      newIntentions[index] = value;
      return {
        ...prev,
        intentions: newIntentions
      };
    });
  };

  // Handle journal entry change
  const handleJournalChange = (value: string) => {
    setRitualData(prev => ({
      ...prev,
      journal_entry: value
    }));
  };

  // Navigate to next step
  const nextStep = () => {
    // Validate current step
    if (currentStep === 'gratitude') {
      // Check if at least one gratitude item is filled
      const hasGratitude = ritualData.gratitude_items.some(item => item.trim() !== '');
      if (!hasGratitude) {
        toast({
          title: "Gratitude Required",
          description: "Please share at least one thing you're grateful for",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep('intentions');
      setShowInputs(false);
    } else if (currentStep === 'intentions') {
      // Check if at least one intention is filled
      const hasIntention = ritualData.intentions.some(item => item.trim() !== '');
      if (!hasIntention) {
        toast({
          title: "Intention Required",
          description: "Please share at least one intention for today",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep('journal');
      setShowInputs(false);
    }
  };

  // Handle final submission
  const handleComplete = async () => {
    if (!userId) {
      toast({
        title: "Authentication error",
        description: "Please sign in to save your morning ritual",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format data
      const today = new Date().toISOString().split('T')[0];
      
      // Filter out empty fields
      const filteredGratitude = ritualData.gratitude_items.filter(item => item.trim() !== '');
      const filteredIntentions = ritualData.intentions.filter(item => item.trim() !== '');
      const journalEntry = ritualData.journal_entry?.trim() || null;
      
      // Save to morning_rituals table only (for testing)
      const { error: ritualError } = await supabase
        .from('morning_rituals')
        .insert({
          user_id: userId,
          gratitude_items: filteredGratitude,
          intentions: filteredIntentions,
          journal_entry: journalEntry,
          date: today
        });
        
      if (ritualError) throw ritualError;
      
      toast({
        title: "Morning Ritual Complete",
        description: "Your morning ritual has been saved successfully"
      });
      
      // Navigate to home page
      navigate('/');
      
    } catch (error: any) {
      console.error('Error saving morning ritual:', error);
      toast({
        title: "Error",
        description: "Failed to save your morning ritual: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Text content based on current step
  const getStepContent = () => {
    switch (currentStep) {
      case 'greeting':
        return {
          title: "Good Morning",
          description: "Take a moment to center yourself. Breathe deeply and prepare to start your day with intention."
        };
      case 'gratitude':
        return {
          title: "What are you grateful for today?",
          description: "Consider the people, experiences, or things that bring joy to your life."
        };
      case 'intentions':
        return {
          title: "What are your intentions for today?",
          description: "Set your focus and purpose for the hours ahead."
        };
      case 'journal':
        return {
          title: "Any reflections to start your day?",
          description: "Take a moment to express your thoughts or feelings."
        };
    }
  };

  // Animation utilities for easing functions
  const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3);
  };
  
  const easeInOutQuad = (x: number): number => {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  };

  // Calculate sun position based on animation progress with non-linear easing
  const getSunPosition = () => {
    // Use easing function for smoother, more natural movement
    const easedProgress = easeOutCubic(animationProgress / 100);
    
    // Start at 30% from bottom, rise to 80% while moving right
    const bottomOffset = 30 + (easedProgress * 50); // Rise from 30% to 80%
    const leftOffset = 50 + (easedProgress * 35); // Move from center (50%) to right (85%)
    
    return {
      bottom: `${bottomOffset}%`,
      left: `${leftOffset}%`,
    };
  };

  // Calculate color transition based on animation progress
  const getColorAtProgress = (startColor: string, endColor: string, progress: number): string => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : {r: 0, g: 0, b: 0};
    };
    
    const start = hexToRgb(startColor);
    const end = hexToRgb(endColor);
    
    // Calculate transition
    const r = Math.floor(start.r + (end.r - start.r) * progress);
    const g = Math.floor(start.g + (end.g - start.g) * progress);
    const b = Math.floor(start.b + (end.b - start.b) * progress);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // The Monument Valley inspired background with animated sun
  const SunriseBackground = () => {
    const sunPosition = getSunPosition();
    const easedProgress = easeOutCubic(animationProgress / 100);
    
    // Pulsing effect for sun - subtle breathing animation
    const [pulseScale, setPulseScale] = useState(1);
    
    useEffect(() => {
      const pulseInterval = setInterval(() => {
        setPulseScale(prev => 1 + 0.03 * Math.sin(Date.now() / 1000));
      }, 50);
      
      return () => clearInterval(pulseInterval);
    }, []);
    
    // Color transitions from cool to warm
    const skyTopColor = getColorAtProgress('#4A3B5E', '#FFB697', easedProgress);
    const skyMidColor = getColorAtProgress('#5D4970', '#FF9B7B', easedProgress);
    const skyBottomColor = getColorAtProgress('#392433', '#7A616C', Math.min(1, easedProgress * 1.5));
    
    return (
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Base sky gradient - always present, transitions from cool to warm */}
        <div 
          className="absolute inset-0" 
          style={{
            background: `linear-gradient(to bottom, 
              ${skyTopColor} 0%, 
              ${skyMidColor} 50%, 
              ${skyBottomColor} 100%)`,
          }}
        />
        
        {/* Atmospheric mist/fog effect near horizon */}
        <div 
          className="absolute inset-x-0 bottom-0 h-1/3" 
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 100%)',
            opacity: 0.2 + easedProgress * 0.2,
            backdropFilter: 'blur(1px)'
          }}
        />

        {/* Dynamic Sun Rays */}
        <div 
          className="absolute z-4"
          style={{ 
            bottom: sunPosition.bottom, 
            left: sunPosition.left,
            width: '25rem',
            height: '25rem',
            transform: 'translate(-50%, 50%)',
            background: 'radial-gradient(circle, rgba(255, 233, 166, 0) 30%, rgba(255, 200, 55, 0) 70%)',
            opacity: 0.4 * easedProgress,
            filter: 'blur(5px)',
          }}
        >
          {/* Sun rays */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="absolute top-1/2 left-1/2 bg-[#FFF4D6]"
              style={{
                height: `${10 + easedProgress * 15}rem`,
                width: '0.5rem',
                transformOrigin: 'bottom center',
                transform: `translate(-50%, -100%) rotate(${i * 30}deg) scaleY(${0.7 + Math.sin(Date.now() / 2000 + i) * 0.3})`,
                opacity: 0.1 + easedProgress * 0.2,
                filter: 'blur(3px)'
              }}
            />
          ))}
        </div>
        
        {/* Animated sun with pulsing effect */}
        <div 
          className="absolute rounded-full bg-gradient-to-br from-[#FFE9A6] to-[#FFC837] z-3"
          style={{ 
            width: '8rem', 
            height: '8rem', 
            bottom: sunPosition.bottom, 
            left: sunPosition.left,
            transform: `translate(-50%, 50%) scale(${pulseScale})`,
            opacity: Math.min(0.4 + (easedProgress * 0.6), 1),
            boxShadow: `0 0 ${Math.min(30 + (easedProgress * 20), 50)}px rgba(255, 200, 55, ${0.3 + easedProgress * 0.2}), 
                       0 0 ${Math.min(60 + (easedProgress * 40), 100)}px rgba(255, 233, 166, ${0.2 + easedProgress * 0.1})`,
          }}
        />
        
        {/* Far distant mountains */}
        <div 
          className="absolute bottom-[25%] left-0 right-0 h-[20%] z-10"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(86, 63, 87, 0.5) 30%, rgba(59, 43, 69, 0.7) 60%, transparent 100%)`,
            clipPath: 'polygon(0% 100%, 15% 80%, 25% 85%, 35% 75%, 45% 90%, 55% 80%, 65% 85%, 75% 70%, 85% 80%, 100% 75%, 100% 100%)',
            transform: `translateY(${5 - easedProgress * 5}px)`,
          }}
        />
        
        {/* Mid distant mountains */}
        <div 
          className="absolute bottom-[23%] left-0 right-0 h-[18%] z-10"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(69, 47, 80, 0.6) 30%, rgba(45, 33, 56, 0.8) 60%, transparent 100%)`,
            clipPath: 'polygon(0% 100%, 5% 90%, 15% 75%, 30% 85%, 45% 65%, 60% 80%, 75% 70%, 90% 85%, 100% 65%, 100% 100%)',
            transform: `translateY(${10 - easedProgress * 10}px)`,
          }}
        />
        
        {/* Near mountains with Monument Valley style structures */}
        <div 
          className="absolute bottom-[20%] left-0 right-0 h-[25%] z-10"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(55, 35, 71, 0.7) 30%, rgba(36, 21, 48, 1) 60%, transparent 100%)`,
            clipPath: 'polygon(0% 100%, 10% 80%, 15% 80%, 15% 60%, 20% 60%, 20% 80%, 30% 70%, 40% 75%, 45% 55%, 46% 55%, 46% 45%, 48% 45%, 48% 55%, 50% 55%, 50% 75%, 60% 85%, 70% 75%, 80% 90%, 85% 90%, 85% 70%, 87% 70%, 87% 90%, 95% 80%, 100% 90%, 100% 100%)',
            transform: `translateY(${15 - easedProgress * 15}px)`,
          }}
        />
        
        {/* Water reflection surface with ripple effect */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[20%] z-5"
          style={{
            background: 'linear-gradient(180deg, rgba(97, 122, 158, 0.8) 0%, rgba(52, 74, 94, 0.9) 100%)',
            backdropFilter: 'blur(4px)',
            overflow: 'hidden',
          }}
        >
          {/* Water ripples (multiple circles that pulse out) */}
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full border border-white/20"
              style={{
                width: `${(i+1) * 10 + Math.sin(Date.now() / 1000 + i) * 5}%`,
                height: `${((i+1) * 10 + Math.sin(Date.now() / 1000 + i) * 5) / 3}%`,
                left: `${50 + Math.sin(Date.now() / 2000 + i * 2) * 5}%`,
                bottom: '0%',
                transform: 'translate(-50%, 50%)',
                opacity: Math.max(0.1, 0.2 - i * 0.05),
                filter: 'blur(1px)',
                background: 'linear-gradient(180deg, rgba(135, 206, 235, 0.1) 0%, rgba(70, 130, 180, 0.05) 100%)'
              }}
            />
          ))}
        </div>

        {/* Atmospheric glow that radiates outward */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${sunPosition.left} ${100 - parseFloat(sunPosition.bottom)}%, rgba(255, 156, 123, 0.3) 0%, transparent 70%)`,
            opacity: Math.min(0.3 + (easedProgress * 0.5), 0.8)
          }}
        />

        {/* Subtle color overlay for smooth transitions */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, 
              rgba(${180 - easedProgress * 30}, ${165 - easedProgress * 15}, ${170 + easedProgress * 10}, 0.2) 0%, 
              rgba(${150 + easedProgress * 40}, ${126 + easedProgress * 30}, ${135 - easedProgress * 20}, 0.2) 100%)`,
            mixBlendMode: 'soft-light'
          }}
        />
      </div>
    );
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center">
      {/* Sunrise background */}
      <SunriseBackground />
      
      {/* Content container */}
      <div className="relative z-10 max-w-lg w-full mx-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8"
          >
            {/* Step title and description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-center text-white mb-4">
                {getStepContent().title}
              </h1>
              <p className="text-center text-white/80 text-lg mb-8">
                {getStepContent().description}
              </p>
            </motion.div>
            
            {/* Step-specific content */}
            {currentStep === 'greeting' && (
              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button 
                  onClick={nextStep}
                  className="bg-white/20 hover:bg-white/30 text-white px-8 py-6 rounded-full text-xl border border-white/30"
                >
                  Begin
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </motion.div>
            )}
            
            {currentStep === 'gratitude' && showInputs && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {ritualData.gratitude_items.map((item, index) => (
                  <motion.div 
                    key={`gratitude-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      placeholder={`I am grateful for...`}
                      value={item}
                      onChange={(e) => handleGratitudeChange(index, e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </motion.div>
                ))}
                
                <motion.div 
                  className="flex justify-between pt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
            
            {currentStep === 'intentions' && showInputs && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {ritualData.intentions.map((item, index) => (
                  <motion.div 
                    key={`intention-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      placeholder={`I intend to...`}
                      value={item}
                      onChange={(e) => handleIntentionChange(index, e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </motion.div>
                ))}
                
                <motion.div 
                  className="flex justify-between pt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => setCurrentStep('gratitude')}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
            
            {currentStep === 'journal' && showInputs && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Textarea
                    placeholder="Write your thoughts here..."
                    value={ritualData.journal_entry || ''}
                    onChange={(e) => handleJournalChange(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[150px]"
                  />
                </motion.div>
                
                <motion.div 
                  className="flex justify-between pt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => setCurrentStep('intentions')}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Complete
                        <Check className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}; 