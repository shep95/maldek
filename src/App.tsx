import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Onboarding from "./pages/Onboarding";
import Videos from "./pages/Videos";
import Profile from "./pages/Profile";
import PostDetail from "./pages/PostDetail";
import DashboardLayout from "./components/dashboard/DashboardLayout";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check initial auth state
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          // Clear any invalid session data
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(!!session);
        console.log("Initial auth state:", !!session);
      } catch (error: any) {
        console.error("Auth check error:", error);
        // If we get a 403/user not found error, clear the session
        if (error.status === 403 || error.message?.includes('user_not_found')) {
          console.log("Invalid session detected, clearing...");
          await supabase.auth.signOut();
          localStorage.removeItem('supabase.auth.token');
          setIsAuthenticated(false);
          toast.error("Your session has expired. Please sign in again.");
        }
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticated(!!session);
      console.log("Auth state changed:", !!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/auth"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Auth />
                  )
                }
              />
              <Route
                path="/onboarding"
                element={
                  isAuthenticated ? <Onboarding /> : <Navigate to="/auth" replace />
                }
              />
              <Route
                element={
                  isAuthenticated ? (
                    <DashboardLayout />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/post/:postId" element={<PostDetail />} />
              </Route>
            </Routes>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </SessionContextProvider>
  );
};

export default App;