
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Journal from "./pages/Journal";
import Goals from "./pages/Goals";
import Strava from "./pages/Strava";
import NotFound from "./pages/NotFound";
import WeeklyReflection from "./pages/WeeklyReflection"; 
import { AppHeader } from "./components/AppHeader";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <>
      <AppHeader />
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
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
          path="/journal" 
          element={
            <ProtectedRoute>
              <Journal />
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
          path="/strava" 
          element={
            <ProtectedRoute>
              <Strava />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/weekly-reflection" 
          element={
            <ProtectedRoute>
              <WeeklyReflection />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
