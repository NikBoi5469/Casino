import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { DeveloperFooter } from "@/components/developer-footer";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DicePage from "@/pages/games/dice";
import SlotsPage from "@/pages/games/slots";
import CrashPage from "@/pages/games/crash";
import MinesPage from "@/pages/games/mines";
import TradingPage from "@/pages/games/trading";
import AdminDashboard from "@/pages/admin/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen relative pb-16">
      <Switch>
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/games/dice" component={DicePage} />
        <ProtectedRoute path="/games/slots" component={SlotsPage} />
        <ProtectedRoute path="/games/crash" component={CrashPage} />
        <ProtectedRoute path="/games/mines" component={MinesPage} />
        <ProtectedRoute path="/games/trading" component={TradingPage} />
        <ProtectedRoute path="/admin" component={AdminDashboard} />
        <Route path="/auth/login">
          {() => <AuthPage mode="login" />}
        </Route>
        <Route path="/auth/register">
          {() => <AuthPage mode="register" />}
        </Route>
        <Route path="/auth">
          {() => <AuthPage mode="login" />}
        </Route>
        <Route component={NotFound} />
      </Switch>
      <DeveloperFooter />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;