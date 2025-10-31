import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import CharacterCreation from "@/pages/character-creation";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

function Router() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Check if user has a character only when authenticated
  const { data: character, isLoading: characterLoading } = useQuery({
    queryKey: ["/api/character"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : characterLoading ? (
        <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : !character ? (
        <>
          <Route path="/create-character" component={CharacterCreation} />
          <Route path="/" component={CharacterCreation} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/habits" component={Dashboard} />
          <Route path="/dailies" component={Dashboard} />
          <Route path="/todos" component={Dashboard} />
          <Route path="/rewards" component={Dashboard} />
          <Route path="/crew" component={Dashboard} />
          <Route path="/market" component={Dashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
