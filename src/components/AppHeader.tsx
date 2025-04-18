import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Rocket, RefreshCw, LogOut, Menu } from "lucide-react";
import { useIntroScreen } from "@/hooks/useIntroScreen";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AppHeader = () => {
  const location = useLocation();
  const { session, signOut } = useAuth();
  const { resetIntroScreen } = useIntroScreen();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!session) return null;

  const isActiveRoute = (route: string) => {
    return location.pathname === route || location.pathname.startsWith(`${route}/`);
  };

  const NavButton = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Button 
      asChild 
      variant={isActiveRoute(to) ? "secondary" : "ghost"} 
      size="sm"
      className={isActiveRoute(to) ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}
    >
      <Link to={to}>{children}</Link>
    </Button>
  );

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/tasks", label: "Tasks" },
  ];

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-b border-indigo-700 py-3 shadow-lg">
      <div className="container flex justify-between items-center">
        <div className="flex items-center">
          <Rocket className="h-6 w-6 mr-2 text-yellow-300" />
          <h1 className="text-xl font-bold text-white">Launchpad</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => (
            <NavButton key={item.path} to={item.path}>
              {item.label}
            </NavButton>
          ))}
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

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navItems.map((item) => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} className="cursor-pointer">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={resetIntroScreen}>
                Reset Intro Screen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
