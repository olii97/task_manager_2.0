import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { FeatureSection } from '@/components/landing/FeatureSection';
import { IconBackgroundPattern } from '@/components/landing/IconBackgroundPattern';
import { Rocket, Brain, Zap, TimerIcon, Eye } from 'lucide-react'; // Updated icons

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/auth?mode=signup&email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      <LandingHeader />

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pt-48 lg:pb-32 flex items-center justify-center">
          <IconBackgroundPattern />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Rocket className="mx-auto h-16 w-16 text-indigo-600 sm:h-20 sm:w-20" />
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Organize your life
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-700 sm:text-xl">
              Become less stressed by neatly organizing everything you have to do with Launchpad.
            </p>
            <form onSubmit={handleSignUp} className="mt-10 max-w-md mx-auto sm:flex sm:justify-center">
              <label htmlFor="email" className="sr-only">Email address</label>
              <Input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                required
                className="w-full px-5 py-3 placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs border-slate-300 rounded-md shadow-sm"
                placeholder="alice@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="mt-3 rounded-md shadow-sm sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <Button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 border border-transparent rounded-md font-medium"
                >
                  Sign up
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Feature Sections */}
        <FeatureSection
          title="AI Quick Add"
          description={(
            <p>
              Effortlessly add tasks with our smart AI. It analyzes your input for title, priority, energy, and category. Get organized faster than ever.
            </p>
          )}
          videoSrc="/QuickAddAI.mp4"
        />

        <FeatureSection
          title="High & Low Energy Tasks"
          description={(
            <p>
              Organize your day by energy levels. Schedule demanding tasks for peak focus and simpler ones for lighter periods, maximizing your productivity flow.
            </p>
          )}
          imageSrc="/HighLow.png"
          className="bg-white/70 backdrop-blur-sm"
        />

        <FeatureSection
          title="Pomodoro Timer & Focus"
          description={(
            <p>
              Boost productivity with the built-in Pomodoro timer. Work in focused sprints with short breaks to maintain concentration and avoid burnout.
            </p>
          )}
          imageSrc="/Pomodoro.png"
        />
      </main>

      <footer className="bg-transparent mt-10">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-base text-slate-600">
            &copy; {new Date().getFullYear()} Launchpad. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
