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
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Goals from "./pages/Goals";
import Journal from "./pages/Journal";
import Strava from "./pages/Strava";
import Tasks from "./pages/Tasks";
import Weight from "./pages/Weight";
import Intentions from "./pages/Intentions";
import IntentionsEdit from "./pages/IntentionsEdit";
import NotFound from "./pages/NotFound";
import MorningRitual from "./pages/MorningRitual";
import Nutrition from "./pages/Nutrition";
import { QuarterEndReminder } from "./components/QuarterEndReminder";
import { PomodoroProvider } from "./components/pomodoro/PomodoroProvider";
import { PomodoroTimer } from "./components/pomodoro/PomodoroTimer";
import { PomodoroBlurOverlay } from "./components/pomodoro/PomodoroBlurOverlay";
import { TabBarTimer } from "./components/pomodoro/TabBarTimer";
import Calendar from "./pages/Calendar";

const queryClient = new QueryClient();

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
        <AuthProvider>
          <PomodoroProvider>
            <QuarterEndReminder />
            <PomodoroBlurOverlay />
            <PomodoroTimer />
            <TabBarTimer />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    <Goals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journal"
                element={
                  <ProtectedRoute>
                    <Journal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/intentions"
                element={
                  <ProtectedRoute>
                    <Intentions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/intentions/edit"
                element={
                  <ProtectedRoute>
                    <IntentionsEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/intentions/edit/:id"
                element={
                  <ProtectedRoute>
                    <IntentionsEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/strava"
                element={
                  <ProtectedRoute>
                    <Strava />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weight"
                element={
                  <ProtectedRoute>
                    <Weight />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nutrition"
                element={
                  <ProtectedRoute>
                    <Nutrition />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morning-ritual"
                element={
                  <ProtectedRoute>
                    <MorningRitual />
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
