import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Rocket, RefreshCw, Sunrise, Scale, Apple, Calendar, LogOut } from "lucide-react";
import { useIntroScreen } from "@/hooks/useIntroScreen";

export const AppHeader = () => {
  const location = useLocation();
  const { session, signOut } = useAuth();
  const { resetIntroScreen } = useIntroScreen();

  if (!session) return null;

  const isActiveRoute = (route: string) => {
    return location.pathname === route || location.pathname.startsWith(`${route}/`);
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-b border-indigo-700 py-3 shadow-lg">
      <div className="container flex justify-between items-center">
        <div className="flex items-center">
          <Rocket className="h-6 w-6 mr-2 text-yellow-300" />
          <h1 className="text-xl font-bold text-white">Launchpad</h1>
        </div>
        <nav className="flex items-center space-x-2">
          <Button 
            asChild 
            variant={isActiveRoute("/") ? "secondary" : "ghost"} 
            size="sm"
            className={isActiveRoute("/") ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}
          >
            <Link to="/">Dashboard</Link>
          </Button>
          <Button 
            asChild 
            variant={isActiveRoute("/journal") ? "secondary" : "ghost"} 
            size="sm"
            className={isActiveRoute("/journal") ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}
          >
            <Link to="/journal">Journal</Link>
          </Button>
          <Button 
            asChild 
            variant={isActiveRoute("/tasks") ? "secondary" : "ghost"} 
            size="sm"
            className={isActiveRoute("/tasks") ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}
          >
            <Link to="/tasks">Tasks</Link>
          </Button>
          <Button 
            asChild 
            variant={isActiveRoute("/goals") ? "secondary" : "ghost"} 
            size="sm"
            className={isActiveRoute("/goals") ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}
          >
            <Link to="/goals">Goals</Link>
          </Button>
          <Button 
            asChild 
            variant={isActiveRoute("/intentions") ? "secondary" : "ghost"} 
            size="sm"
            className={isActiveRoute("/intentions") ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}
          >
            <Link to="/intentions">Intentions</Link>
          </Button>
          <Button 
            asChild 
            variant={isActiveRoute("/strava") ? "secondary" : "ghost"} 
            size="sm"
            className={isActiveRoute("/strava") ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}
          >
            <Link to="/strava">Strava</Link>
          </Button>
          <Button 
            asChild 
            variant={isActiveRoute("/weight") ? "secondary" : "ghost"} 
            size="sm"
            className={isActiveRoute("/weight") ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}
          >
            <Link to="/weight" className="flex items-center">
              <Scale className="h-4 w-4 mr-1" />
              <span>Weight</span>
            </Link>
          </Button>
          <Button 
            asChild 
            variant={isActiveRoute("/nutrition") ? "secondary" : "ghost"} 
            size="sm"
            className={isActiveRoute("/nutrition") ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}
          >
            <Link to="/nutrition" className="flex items-center">
              <Apple className="h-4 w-4 mr-1" />
              <span>Nutrition</span>
            </Link>
          </Button>
          <Button 
            asChild 
            variant={isActiveRoute("/calendar") ? "secondary" : "ghost"} 
            size="sm"
            className={isActiveRoute("/calendar") ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}
          >
            <Link to="/calendar" className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Calendar</span>
            </Link>
          </Button>
          <Button 
            asChild 
            variant={isActiveRoute("/morning-ritual") ? "secondary" : "ghost"} 
            size="sm"
            className={isActiveRoute("/morning-ritual") ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}
          >
            <Link to="/morning-ritual" className="flex items-center">
              <Sunrise className="h-4 w-4 mr-1" />
              <span>Morning Ritual</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10 ml-2"
            onClick={resetIntroScreen}
            title="Reset Intro Screen"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10 ml-2"
            onClick={signOut}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
};
