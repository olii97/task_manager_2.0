
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";

export const AppHeader = () => {
  const location = useLocation();
  const { session } = useAuth();

  if (!session) return null;

  const isActiveRoute = (route: string) => {
    return location.pathname === route || location.pathname.startsWith(`${route}/`);
  };

  return (
    <header className="bg-white border-b border-gray-200 py-3">
      <div className="container flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-700">Daily Driver</h1>
        </div>
        <nav className="flex items-center space-x-2">
          <Button 
            asChild 
            variant={isActiveRoute("/") ? "default" : "ghost"} 
            size="sm"
          >
            <Link to="/">Dashboard</Link>
          </Button>
          <Button 
            asChild 
            variant={isActiveRoute("/journal") ? "default" : "ghost"} 
            size="sm"
          >
            <Link to="/journal">Journal</Link>
          </Button>
          <Button 
            asChild 
            variant={isActiveRoute("/tasks") ? "default" : "ghost"} 
            size="sm"
          >
            <Link to="/tasks">Tasks</Link>
          </Button>
          <Button 
            asChild 
            variant={isActiveRoute("/goals") ? "default" : "ghost"} 
            size="sm"
          >
            <Link to="/goals">Goals</Link>
          </Button>
          <Button 
            asChild 
            variant={isActiveRoute("/intentions") ? "default" : "ghost"} 
            size="sm"
          >
            <Link to="/intentions">Intentions</Link>
          </Button>
          <Button 
            asChild 
            variant={isActiveRoute("/strava") ? "default" : "ghost"} 
            size="sm"
          >
            <Link to="/strava">Strava</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};
