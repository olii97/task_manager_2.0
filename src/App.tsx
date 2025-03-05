import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auth } from "@/pages/Auth";
import Index from "@/pages/Index";
import Journal from "@/pages/Journal";
import Tasks from "@/pages/Tasks";
import Goals from "@/pages/Goals";
import Intentions from "@/pages/Intentions";
import IntentionsEdit from "@/pages/IntentionsEdit";
import Strava from "@/pages/Strava";
import Weight from "@/pages/Weight";
import NotFound from "@/pages/NotFound";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ui/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <ToastProvider />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <AppHeader />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/intentions" element={<Intentions />} />
                  <Route path="/intentions/edit/:id" element={<IntentionsEdit />} />
                  <Route path="/strava" element={<Strava />} />
                  <Route path="/weight" element={<Weight />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
}

export default App;
