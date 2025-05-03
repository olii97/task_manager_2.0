import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { AppHeader } from "@/components/AppHeader";
import { MotionConfig } from "framer-motion";
import IntroScreen from "@/components/intro/IntroScreen";
import { useIntroScreen } from "@/hooks/useIntroScreen";
import { ProfileInitializer } from "@/components/auth/ProfileInitializer";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import Auth from "./pages/Auth";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";
import { PomodoroProvider } from "./components/pomodoro/PomodoroProvider";
import { PomodoroTimer } from "./components/pomodoro/PomodoroTimer";
import { PomodoroBlurOverlay } from "./components/pomodoro/PomodoroBlurOverlay";
import { TabBarTimer } from "./components/pomodoro/TabBarTimer";

const queryClient = new QueryClient();

// Component to clear any stuck toast notifications
function ToastCleaner() {
  const { dismiss } = useToast();
  
  useEffect(() => {
    // Clear all toasts when component mounts
    const clearToasts = () => dismiss();
    clearToasts();
    
    // Also set a periodic cleanup to catch any stuck toasts
    const intervalId = setInterval(clearToasts, 15000);
    
    return () => clearInterval(intervalId);
  }, [dismiss]);
  
  return null;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const { showIntroScreen, completeIntroScreen, isLoading: introLoading } = useIntroScreen();

  if (loading || introLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" />;
  }

  return (
    <>
      {showIntroScreen && <IntroScreen onComplete={completeIntroScreen} />}
      <AppHeader />
      {children}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MotionConfig reducedMotion="user">
        <Toaster />
        <Sonner />
        <ToastCleaner />
        <AuthProvider>
          <PomodoroProvider>
            <ProfileInitializer />
            <PomodoroBlurOverlay />
            <PomodoroTimer />
            <TabBarTimer />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PomodoroProvider>
        </AuthProvider>
      </MotionConfig>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
