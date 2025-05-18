import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

export function LandingHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 py-4 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 shadow-md">
      <nav className="flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Rocket className="h-7 w-7 text-white" /> 
          <span className="text-xl font-bold text-white">Launchpad</span>
        </Link>
        <div className="space-x-2 sm:space-x-4">
          <Button variant="ghost" asChild className="font-medium text-white hover:bg-white/20 border-2 border-transparent hover:border-white/80">
            <Link to="/auth?mode=signup">Sign up</Link>
          </Button>
          <Button variant="secondary" asChild className="bg-white text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 font-medium border-0">
            <Link to="/auth?mode=login">Log in</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
} 