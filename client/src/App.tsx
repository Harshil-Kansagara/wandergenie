import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";

import Home from "./pages/home";
import QuizPage from "./pages/quiz";
import Planner from "./pages/planner";
import Dashboard from "./pages/dashboard";
import ItineraryPage from "./pages/itinerary-page";
import GeneratingItineraryPage from "./pages/generating-itinerary";
import NotFound from "./pages/not-found";
import TripsPage from "./pages/trips";
import ProfilePage from "./pages/profile";
import Layout from "@/components/Layout";
import SidebarLayout from "./components/sidebar-layout";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Switch>
            {/* Routes with the new SidebarLayout */}
            <Route path="/dashboard">
              <SidebarLayout><Dashboard /></SidebarLayout>
            </Route>
            <Route path="/planner">
              <SidebarLayout><Planner /></SidebarLayout>
            </Route>
            <Route path="/trips">
              <SidebarLayout><TripsPage /></SidebarLayout>
            </Route>
            <Route path="/profile">
              <SidebarLayout><ProfilePage /></SidebarLayout>
            </Route>

            {/* Routes with the original simple Layout */}
            <Route path="/"><Layout><Home /></Layout></Route>
            <Route path="/quiz"><Layout><QuizPage /></Layout></Route>
            <Route path="/generating-itinerary"><Layout><GeneratingItineraryPage /></Layout></Route>
            <Route path="/itinerary/:id"><Layout><ItineraryPage /></Layout></Route>
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
