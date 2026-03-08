import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import YoungPeople from "./pages/YoungPeople";
import NewYoungPerson from "./pages/NewYoungPerson";
import YoungPersonDetails from "./pages/YoungPersonDetails";
import Tasks from "./pages/Tasks";
import NewTask from "./pages/NewTask";
import TaskDetail from "./pages/TaskDetail";
import KeyworkSessions from "./pages/KeyworkSessions";
import NewKeyworkSession from "./pages/NewKeyworkSession";
import KeyworkSessionDetail from "./pages/KeyworkSessionDetail";
import RiskAssessments from "./pages/RiskAssessments";
import NewRiskAssessment from "./pages/NewRiskAssessment";
import RiskAssessmentDetail from "./pages/RiskAssessmentDetail";
import Chronology from "./pages/Chronology";
import NewChronologyEntry from "./pages/NewChronologyEntry";
import ChronologyDetail from "./pages/ChronologyDetail";
import MissingEpisodes from "./pages/MissingEpisodes";
import NewMissingEpisode from "./pages/NewMissingEpisode";
import MissingEpisodeDetail from "./pages/MissingEpisodeDetail";
import ReportReturn from "./pages/ReportReturn";
import NotFound from "./pages/NotFound";
import HealthWellbeing from "./pages/HealthWellbeing";

import EditYoungPerson from "./pages/EditYoungPerson";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/young-people" element={<YoungPeople />} />
              <Route path="/young-people/new" element={<NewYoungPerson />} />
              <Route path="/young-people/:id" element={<YoungPersonDetails />} />
              <Route path="/young-people/:id/edit" element={<EditYoungPerson />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/new" element={<NewTask />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/keywork-sessions" element={<KeyworkSessions />} />
              <Route path="/keywork-sessions/new" element={<NewKeyworkSession />} />
              <Route path="/keywork-sessions/:id" element={<KeyworkSessionDetail />} />
              <Route path="/risk-assessments" element={<RiskAssessments />} />
              <Route path="/risk-assessments/new" element={<NewRiskAssessment />} />
              <Route path="/risk-assessments/:id" element={<RiskAssessmentDetail />} />
              <Route path="/chronology" element={<Chronology />} />
              <Route path="/chronology/new" element={<NewChronologyEntry />} />
              <Route path="/chronology/:id" element={<ChronologyDetail />} />
              <Route path="/missing-episodes" element={<MissingEpisodes />} />
              <Route path="/missing-episodes/new" element={<NewMissingEpisode />} />
              <Route path="/missing-episodes/:id" element={<MissingEpisodeDetail />} />
              <Route path="/missing-episodes/:id/report-return" element={<ReportReturn />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;