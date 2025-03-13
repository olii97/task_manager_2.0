import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Sun } from 'lucide-react';
import OpenAI from 'openai';

// Initialize OpenAI with the API key from environment variables
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // This should be set in your .env file
  dangerouslyAllowBrowser: true // Only for demo purposes, see note below
});

// Note: In production, it's better to keep API keys on the server side
// This implementation is for demonstration purposes only

type Step = 'welcome' | 'gratitude' | 'gratitude-reflection' | 'intentions' | 'intentions-reflection' | 'journal' | 'final';

// AI response types
type AiResponse = {
  content: string;
  isLoading: boolean;
  displayedContent: string; // For streaming text effect
};

export const MorningRitualFlow = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const userName = session?.user?.user_metadata?.name || 'there';
  
  // State for the current step
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  
  // State for user inputs
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(['', '', '']);
  const [intentions, setIntentions] = useState<string[]>(['', '', '']);
  const [journalEntry, setJournalEntry] = useState<string>('');
  const [isAllGratitudeFilled, setIsAllGratitudeFilled] = useState(false);
  
  // State for sun animation
  const [sunPosition, setSunPosition] = useState(0);
  
  // State for AI responses
  const [gratitudeResponse, setGratitudeResponse] = useState<AiResponse>({ 
    content: '', 
    isLoading: false,
    displayedContent: ''
  });
  const [intentionsResponse, setIntentionsResponse] = useState<AiResponse>({ 
    content: '', 
    isLoading: false,
    displayedContent: ''
  });
  
  // Add a new state variable for raw intentions input
  const [intentionsRawInput, setIntentionsRawInput] = useState<string>('');
  
  // References
  const gratitudeRef1 = useRef<HTMLInputElement>(null);
  const gratitudeRef2 = useRef<HTMLInputElement>(null);
  const gratitudeRef3 = useRef<HTMLInputElement>(null);
  const intentionsRef = useRef<HTMLTextAreaElement>(null);
  const journalRef = useRef<HTMLTextAreaElement>(null);

  // AI response display - use typewriter effect
  useEffect(() => {
    if (currentStep === 'gratitude-reflection' && !gratitudeResponse.isLoading && gratitudeResponse.content) {
      setGratitudeResponse(prev => ({ ...prev, displayedContent: '' }));
      const fadeInTimeout = setTimeout(() => {
        setGratitudeResponse(prev => ({ ...prev, displayedContent: gratitudeResponse.content }));
      }, 500); // Delay for fade-in effect
      return () => clearTimeout(fadeInTimeout);
    }
  }, [currentStep, gratitudeResponse.isLoading, gratitudeResponse.content]);

  useEffect(() => {
    if (currentStep === 'intentions-reflection' && !intentionsResponse.isLoading && intentionsResponse.content) {
      setIntentionsResponse(prev => ({ ...prev, displayedContent: '' }));
      const fadeInTimeout = setTimeout(() => {
        setIntentionsResponse(prev => ({ ...prev, displayedContent: intentionsResponse.content }));
      }, 500); // Delay for fade-in effect
      return () => clearTimeout(fadeInTimeout);
    }
  }, [currentStep, intentionsResponse.isLoading, intentionsResponse.content]);

  // Further refine sun animation for smoother transition
  useEffect(() => {
    if (currentStep !== 'welcome') {
      const interval = setInterval(() => {
        setSunPosition(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 0.1; // Even slower increment for smoother transition
        });
      }, 50); // Faster interval for smoother animation
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  // Check if all gratitude items are filled
  useEffect(() => {
    const allFilled = gratitudeItems.every(item => item.trim().length > 0);
    setIsAllGratitudeFilled(allFilled);
  }, [gratitudeItems]);

  // Update the useEffect to initialize intentionsRawInput when intentions change
  useEffect(() => {
    // Initialize intentionsRawInput from intentions when component loads
    if (intentionsRawInput === '' && intentions.some(i => i.trim())) {
      setIntentionsRawInput(intentions.filter(Boolean).join('\n'));
    }
  }, [intentions, intentionsRawInput]);

  // Handle AI acknowledgments using OpenAI directly
  const getAiAcknowledgment = async (text: string, type: 'gratitude' | 'intention') => {
    try {
      if (type === 'gratitude') {
        setGratitudeResponse({ content: '', displayedContent: '', isLoading: true });
      } else {
        setIntentionsResponse({ content: '', displayedContent: '', isLoading: true });
      }
      
      // Direct call to OpenAI API using the v2 library
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: 'system', 
            content: `You are a mindful, calming presence guiding a morning ritual.
              The user just shared ${type === 'gratitude' ? 'three things they are grateful for' : 'their intentions for today'}.
              Respond with 2-3 thoughtful sentences acknowledging what they shared.
              Be warm, present, and speak directly to them.
              Use calming, mindful language. Do not use any prefixes like "Standard chat:" and don't use exclamation points.
              Provide just the response text, nothing else.`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      // Extract and clean the response
      let cleanResponse = response.choices[0]?.message?.content || "";
      cleanResponse = cleanResponse.replace(/^(Standard chat:|AI:|Assistant:)/i, '').trim();
      
      // Update the AI response
      if (type === 'gratitude') {
        setGratitudeResponse({ content: cleanResponse, displayedContent: '', isLoading: false });
      } else {
        setIntentionsResponse({ content: cleanResponse, displayedContent: '', isLoading: false });
      }
    } catch (error) {
      console.error('Error getting AI acknowledgment:', error);
      const defaultResponse = "I appreciate you sharing what's meaningful to you this morning. Your awareness sets a positive tone for the day ahead.";
      
      if (type === 'gratitude') {
        setGratitudeResponse({ content: defaultResponse, displayedContent: '', isLoading: false });
      } else {
        setIntentionsResponse({ content: defaultResponse, displayedContent: '', isLoading: false });
      }
    }
  };

  // Handle saving the morning ritual data
  const saveMorningRitualAndJournal = async () => {
    if (!session?.user) return;
    
    try {
      // Save morning ritual
      const { error: ritualError } = await supabase
        .from('morning_rituals')
        .insert({
          user_id: session.user.id,
          gratitude_items: gratitudeItems,
          intentions: intentions,
          journal_entry: journalEntry,
          date: new Date().toISOString().split('T')[0]
        } as any);
        
      if (ritualError) {
        console.error('Error saving morning ritual:', ritualError);
      }
      
      // Also add this as a journal entry if journal text exists
      if (journalEntry.trim()) {
        const today = new Date();
        const { error: journalError } = await supabase
          .from('journal_entries')
          .insert({
            user_id: session.user.id,
            date: today.toISOString().split('T')[0],
            reflection: journalEntry,
            gratitude: gratitudeItems.join('\n\n'),
            intentions: intentions.join('\n\n'),
            mood: 3, // Default mid value
            energy: 3, // Default mid value
          });
          
        if (journalError) {
          console.error('Error creating journal entry:', journalError);
        }
      }
    } catch (error) {
      console.error('Error in saveMorningRitualAndJournal:', error);
    }
  };

  // Handle gratitude input changes
  const handleGratitudeChange = (index: number, value: string) => {
    const newGratitudeItems = [...gratitudeItems];
    newGratitudeItems[index] = value;
    setGratitudeItems(newGratitudeItems);
  };

  // Handle intentions input changes
  const handleIntentionsChange = (value: string) => {
    // Store the raw input value
    setIntentionsRawInput(value);
    
    // Process the input for the intentions array
    const intentionList = value
      .split(/[\n,]+/)
      .map(i => i.trim())
      .filter(i => i.length > 0)
      .slice(0, 3); // Limit to 3 intentions
    
    // Fill in the array with empty strings if needed
    const filledIntentions = [...intentionList];
    while (filledIntentions.length < 3) {
      filledIntentions.push('');
    }
    
    setIntentions(filledIntentions);
  };

  // Handle continuing to the next step
  const handleContinue = async () => {
    if (currentStep === 'welcome') {
      setCurrentStep('gratitude');
      setTimeout(() => gratitudeRef1.current?.focus(), 500);
    } 
    else if (currentStep === 'gratitude') {
      if (!isAllGratitudeFilled) return;
      
      // Get AI acknowledgment for all gratitude items
      await getAiAcknowledgment(gratitudeItems.join('\n'), 'gratitude');
      setCurrentStep('gratitude-reflection');
    }
    else if (currentStep === 'gratitude-reflection') {
      setCurrentStep('intentions');
      setTimeout(() => intentionsRef.current?.focus(), 500);
    }
    else if (currentStep === 'intentions') {
      if (!intentions.some(i => i.trim())) return;
      
      // Get AI acknowledgment for intentions
      await getAiAcknowledgment(intentions.filter(i => i.trim()).join('\n'), 'intention');
      setCurrentStep('intentions-reflection');
    }
    else if (currentStep === 'intentions-reflection') {
      setCurrentStep('journal');
      setTimeout(() => journalRef.current?.focus(), 500);
    }
    else if (currentStep === 'journal') {
      setCurrentStep('final');
    }
    else if (currentStep === 'final') {
      await saveMorningRitualAndJournal();
      navigate('/');
    }
  };

  const handleSkip = async () => {
    await saveMorningRitualAndJournal();
    navigate('/');
  };

  const handleJournal = () => {
    navigate('/journal');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.7, // Slower stagger
        duration: 1.5 // Longer duration
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 1.0 } // Longer exit duration
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  // Sunrise sky colors - adjusted to be less bright and more readable
  const getSkyGradient = () => {
    if (currentStep === 'welcome') {
      return "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)";
    }
    
    // Softer, less bright gradient colors
    if (sunPosition < 30) {
      return "linear-gradient(to bottom, #0f172a 0%, #312e81 40%, #6b21a8 70%, #c2410c 100%)";
    } else if (sunPosition < 60) {
      return "linear-gradient(to bottom, #312e81 0%, #6b21a8 30%, #c2410c 60%, #f9fafb 100%)";
    } else {
      return "linear-gradient(to bottom, #6b21a8 0%, #c2410c 30%, #f9fafb 60%, #93c5fd 100%)";
    }
  };

  // Helper function to get cursor animation
  const getTypingCursor = (isDisplaying: boolean) => {
    if (!isDisplaying) return null;
    
    return (
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
        className="inline-block w-2 h-5 bg-white/70 ml-1"
      />
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-all duration-1000"
      style={{ background: getSkyGradient() }}
    >
      {/* Sun rising animation - moved more to the right */}
      {currentStep !== 'welcome' && (
        <motion.div 
          className="absolute pointer-events-none z-10"
          initial={{ y: 200, x: 100 }} // Starting even more to the right
          animate={{ 
            y: -Math.min(sunPosition * 5, 400),
            x: Math.min(sunPosition * 3, 350) // Moving more to the right as it rises
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ bottom: '0', left: '50%' }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-yellow-300 blur-xl opacity-15 scale-150" /> {/* Further reduced opacity */}
            <Sun className="h-32 w-32 text-yellow-300/90" /> {/* Reduced sun opacity */}
          </div>
        </motion.div>
      )}

      {/* Background mountains */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-purple-900/30 z-0 rounded-t-[100%]" />
      <div className="absolute bottom-0 left-0 right-0 h-1/5 bg-purple-800/30 z-0 rounded-t-[100%]" />
      
      {/* Content container */}
      <div className="z-20 w-full max-w-4xl px-4 py-8">
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              className="flex flex-col items-center text-center space-y-8 mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h1 
                className="text-5xl md:text-6xl font-light text-white mt-20"
                variants={itemVariants}
              >
                Good morning, {userName}.
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl text-white/90"
                variants={itemVariants}
              >
                Let's start your day with intention and gratitude.
              </motion.p>
              <motion.div variants={itemVariants}>
                <Button 
                  className="mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20 px-10 py-6 rounded-full text-lg"
                  onClick={handleContinue}
                >
                  Begin Your Morning Ritual
                </Button>
              </motion.div>
            </motion.div>
          )}

          {currentStep === 'gratitude' && (
            <motion.div
              key="gratitude"
              className="flex flex-col items-center text-center space-y-8 mx-auto bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h2 
                className="text-3xl font-light text-white"
                variants={itemVariants}
              >
                What are you grateful for today?
              </motion.h2>
              
              <motion.div 
                className="w-full space-y-4"
                variants={itemVariants}
              >
                <div className="relative">
                  <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white font-medium">1</div>
                  <Input
                    ref={gratitudeRef1}
                    value={gratitudeItems[0]}
                    onChange={(e) => handleGratitudeChange(0, e.target.value)}
                    className="w-full p-4 text-lg bg-gray-700/70 backdrop-blur-sm border-white/10 text-white rounded-lg placeholder-white/60"
                    placeholder="I am grateful for..."
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white font-medium">2</div>
                  <Input
                    ref={gratitudeRef2}
                    value={gratitudeItems[1]}
                    onChange={(e) => handleGratitudeChange(1, e.target.value)}
                    className="w-full p-4 text-lg bg-gray-700/70 backdrop-blur-sm border-white/10 text-white rounded-lg placeholder-white/60"
                    placeholder="I am grateful for..."
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white font-medium">3</div>
                  <Input
                    ref={gratitudeRef3}
                    value={gratitudeItems[2]}
                    onChange={(e) => handleGratitudeChange(2, e.target.value)}
                    className="w-full p-4 text-lg bg-gray-700/70 backdrop-blur-sm border-white/10 text-white rounded-lg placeholder-white/60"
                    placeholder="I am grateful for..."
                  />
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button 
                  className="mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20 px-8 py-2 rounded-full"
                  onClick={handleContinue}
                  disabled={!isAllGratitudeFilled}
                >
                  Continue
                </Button>
              </motion.div>
            </motion.div>
          )}

          {currentStep === 'gratitude-reflection' && (
            <motion.div
              key="gratitude-reflection"
              className="flex flex-col items-center text-center space-y-8 mx-auto bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div 
                className="w-full text-white/90 p-8 border border-white/10 rounded-lg bg-gray-700/40"
                variants={itemVariants}
              >
                {gratitudeResponse.isLoading ? (
                  <div className="py-8 px-4 animate-pulse text-center text-white/80 text-xl">
                    Reflecting on your gratitude...
                  </div>
                ) : (
                  <div className="py-8 px-4 text-center text-white text-xl font-light min-h-[120px] flex items-center justify-center">
                    {gratitudeResponse.displayedContent}
                    {getTypingCursor(gratitudeResponse.displayedContent !== gratitudeResponse.content)}
                  </div>
                )}
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
              >
                <Button 
                  className="mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20 px-8 py-2 rounded-full"
                  onClick={handleContinue}
                  disabled={gratitudeResponse.isLoading || gratitudeResponse.displayedContent !== gratitudeResponse.content}
                >
                  Continue to Intentions
                </Button>
              </motion.div>
            </motion.div>
          )}

          {currentStep === 'intentions' && (
            <motion.div
              key="intentions"
              className="flex flex-col items-center text-center space-y-8 mx-auto bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h2 
                className="text-3xl font-light text-white"
                variants={itemVariants}
              >
                What are your intentions for today?
              </motion.h2>
              
              {/* Gratitude acknowledgment */}
              <motion.div 
                className="w-full text-white/90 p-5 border border-white/10 rounded-lg bg-gray-700/40"
                variants={itemVariants}
              >
                <h3 className="text-left text-lg mb-2 font-medium">Your Gratitude</h3>
                <ul className="list-disc pl-5 text-left space-y-1">
                  {gratitudeItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                
                {gratitudeResponse.content && (
                  <div className="mt-4 py-2 px-4 rounded-md bg-gray-600/40 text-left text-white/80">
                    {gratitudeResponse.content}
                  </div>
                )}
              </motion.div>
              
              <motion.div 
                className="w-full"
                variants={itemVariants}
              >
                <Textarea
                  ref={intentionsRef}
                  value={intentionsRawInput}
                  onChange={(e) => handleIntentionsChange(e.target.value)}
                  className="w-full p-4 text-lg bg-gray-700/70 backdrop-blur-sm border-white/10 text-white rounded-lg min-h-[120px] placeholder-white/60"
                  placeholder="Today, I intend to..."
                  onKeyDown={(e) => {
                    // Ensure Enter key creates a new line
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                    }
                  }}
                />
                <p className="text-xs text-white/70 mt-2 text-left">Enter up to three intentions for your day. Separate multiple intentions with new lines.</p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button 
                  className="mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20 px-8 py-2 rounded-full"
                  onClick={handleContinue}
                  disabled={!intentions.some(i => i.trim())}
                >
                  Continue
                </Button>
              </motion.div>
            </motion.div>
          )}

          {currentStep === 'intentions-reflection' && (
            <motion.div
              key="intentions-reflection"
              className="flex flex-col items-center text-center space-y-8 mx-auto bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div 
                className="w-full text-white/90 p-8 border border-white/10 rounded-lg bg-gray-700/40"
                variants={itemVariants}
              >
                {intentionsResponse.isLoading ? (
                  <div className="py-8 px-4 animate-pulse text-center text-white/80 text-xl">
                    Reflecting on your intentions...
                  </div>
                ) : (
                  <div className="py-8 px-4 text-center text-white text-xl font-light min-h-[120px] flex items-center justify-center">
                    {intentionsResponse.displayedContent}
                    {getTypingCursor(intentionsResponse.displayedContent !== intentionsResponse.content)}
                  </div>
                )}
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
              >
                <Button 
                  className="mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20 px-8 py-2 rounded-full"
                  onClick={handleContinue}
                  disabled={intentionsResponse.isLoading || intentionsResponse.displayedContent !== intentionsResponse.content}
                >
                  Continue to Journal
                </Button>
              </motion.div>
            </motion.div>
          )}

          {currentStep === 'journal' && (
            <motion.div
              key="journal"
              className="flex flex-col items-center text-center space-y-8 mx-auto bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h2 
                className="text-3xl font-light text-white"
                variants={itemVariants}
              >
                Journal Entry
              </motion.h2>
              
              {/* Intentions acknowledgment */}
              <motion.div 
                className="w-full text-white/90 p-5 border border-white/10 rounded-lg bg-gray-700/40"
                variants={itemVariants}
              >
                <h3 className="text-left text-lg mb-2 font-medium">Your Intentions</h3>
                <ul className="list-disc pl-5 text-left space-y-1">
                  {intentions.filter(Boolean).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                
                {intentionsResponse.content && (
                  <div className="mt-4 py-2 px-4 rounded-md bg-gray-600/40 text-left text-white/80">
                    {intentionsResponse.content}
                  </div>
                )}
              </motion.div>
              
              <motion.div 
                className="w-full"
                variants={itemVariants}
              >
                <Textarea
                  ref={journalRef}
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  className="w-full p-4 text-lg bg-gray-700/70 backdrop-blur-sm border-white/10 text-white rounded-lg min-h-[200px] placeholder-white/60"
                  placeholder="Use this space to reflect on your day ahead, your thoughts, or anything else you'd like to journal about..."
                />
                <p className="text-xs text-white/70 mt-2 text-left">This will be saved as today's journal entry.</p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button 
                  className="mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20 px-8 py-2 rounded-full"
                  onClick={handleContinue}
                >
                  Complete Morning Ritual
                </Button>
              </motion.div>
            </motion.div>
          )}

          {currentStep === 'final' && (
            <motion.div
              key="final"
              className="flex flex-col items-center text-center space-y-8 mx-auto bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h2 
                className="text-3xl font-light text-white"
                variants={itemVariants}
              >
                Your morning ritual is complete
              </motion.h2>
              
              <motion.p 
                className="text-xl text-white/90"
                variants={itemVariants}
              >
                You've set positive intentions for your day.
              </motion.p>
              
              <motion.div 
                className="flex space-x-4"
                variants={itemVariants}
              >
                <Button 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20 px-8 py-2 rounded-full"
                  onClick={handleJournal}
                >
                  Go to Journal
                </Button>
                <Button 
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/10 px-8 py-2 rounded-full"
                  onClick={handleContinue}
                >
                  Go to Dashboard
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip button (only show after welcome and before final) */}
      {currentStep !== 'welcome' && currentStep !== 'final' && (
        <motion.div 
          className="absolute bottom-10 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Button 
            variant="ghost" 
            className="text-white/50 hover:text-white hover:bg-white/10"
            onClick={handleSkip}
          >
            Skip for today
          </Button>
        </motion.div>
      )}
    </div>
  );
}; 