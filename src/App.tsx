import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Auth } from '@/pages/Auth';
import { Index } from '@/pages/Index';
import { Journal } from '@/pages/Journal';
import { Tasks } from '@/pages/Tasks';
import { Goals } from '@/pages/Goals';
import { Intentions } from '@/pages/Intentions';
import { IntentionsEdit } from '@/pages/IntentionsEdit';
import { Strava } from '@/pages/Strava';
import { NotFound } from '@/pages/NotFound';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { Toaster } from "@/components/ui/sonner"
import { Weight } from '@/pages/Weight';

function App() {
  return (
    <>
      <Router>
        {/* Update the routes to include the new Weight page */}
        <Routes>
          <Route path="/" element={<DefaultLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/intentions" element={<Intentions />} />
            <Route path="/intentions/edit" element={<IntentionsEdit />} />
            <Route path="/strava" element={<Strava />} />
            <Route path="/weight" element={<Weight />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
