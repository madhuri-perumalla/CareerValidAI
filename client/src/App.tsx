import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { FloatingChatbot } from "@/components/floating-chatbot";
import { CareerProvider, useCareer } from "@/store/career-store";
import { careerAPI } from "@/lib/api";
import { useEffect } from "react";

// Pages
import Home from "@/pages/home";
import GitHubPage from "@/pages/github";
import ResumePage from "@/pages/resume";
import PortfolioPage from "@/pages/portfolio";
import ManualPage from "@/pages/manual";
import InsightsPage from "@/pages/insights";
import BuilderPage from "@/pages/builder";
import NotFound from "@/pages/not-found";

function SessionInitializer() {
  const { state, dispatch } = useCareer();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Get or create session ID
        let sessionId = localStorage.getItem('careervalid-session-id');
        
        const response = await careerAPI.initializeSession(sessionId || undefined);
        
        if (response.sessionId) {
          const newSessionId = response.sessionId;
          localStorage.setItem('careervalid-session-id', newSessionId);
          dispatch({ type: 'SET_SESSION_ID', payload: newSessionId });
          dispatch({ type: 'SET_SESSION_DATA', payload: response });
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
        // Create a fallback session ID
        const fallbackSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        dispatch({ type: 'SET_SESSION_ID', payload: fallbackSessionId });
        localStorage.setItem('careervalid-session-id', fallbackSessionId);
      }
    };

    if (!state.sessionId) {
      initializeSession();
    }
  }, [state.sessionId, dispatch]);

  return null;
}

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/github" component={GitHubPage} />
        <Route path="/resume" component={ResumePage} />
        <Route path="/portfolio" component={PortfolioPage} />
        <Route path="/manual" component={ManualPage} />
        <Route path="/insights" component={InsightsPage} />
        <Route path="/builder" component={BuilderPage} />
        <Route component={NotFound} />
      </Switch>
      <FloatingChatbot />
    </>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SessionInitializer />
      <Router />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CareerProvider>
          <Toaster />
          <AppContent />
        </CareerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
