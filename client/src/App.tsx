import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import Layout from "@/components/Layout";

import Home from "./pages/home";
import QuizPage from "./pages/quiz";
import Planner from "./pages/planner";
import Dashboard from "./pages/dashboard";
import ItineraryPage from "./pages/itinerary-page";
import GeneratingItineraryPage from "./pages/generating-itinerary";
import NotFound from "./pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Layout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/quiz" component={QuizPage} />
              <Route path="/planner" component={Planner} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/generating-itinerary" component={GeneratingItineraryPage} />
              <Route path="/itinerary/:id" component={ItineraryPage} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
