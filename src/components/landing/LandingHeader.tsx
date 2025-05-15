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
          <Button variant="ghost" asChild className="text-indigo-100 hover:text-white hover:bg-white/10">
            <Link to="/auth?mode=signup">Sign up</Link>
          </Button>
          <Button variant="outline" asChild className="border-indigo-300 text-indigo-100 hover:bg-white/10 hover:text-white hover:border-white">
            <Link to="/auth?mode=login">Log in</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
} 