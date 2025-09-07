import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Planner from "@/pages/planner";
import Itinerary from "@/pages/itinerary";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/hooks/use-auth.tsx";
import QuizPage from "./pages/quiz";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/planner" component={Planner} />
      <Route path="/itinerary/:id" component={Itinerary} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/quiz" component={QuizPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Layout>
            <Router />
          </Layout>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
