import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const AuthenticationWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication state...");
        
        // Clear any stale auth data first
        const authKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('supabase.auth.')
        );
        
        if (authKeys.length === 0) {
          console.log("No auth data found in localStorage");
          setIsAuthenticated(false);
          navigate('/auth');
          toast.error("Please sign in to continue");
          return;
        }

        // Check initial auth state
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          authKeys.forEach(key => localStorage.removeItem(key));
          setIsAuthenticated(false);
          navigate('/auth');
          toast.error("Please sign in to continue");
          return;
        }

        if (!session) {
          console.log("No active session found");
          authKeys.forEach(key => localStorage.removeItem(key));
          setIsAuthenticated(false);
          navigate('/auth');
          toast.error("Please sign in to continue");
          return;
        }

        // Verify the user still exists
        const { error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("User verification error:", userError);
          if (userError.status === 403 || userError.message?.includes('user_not_found')) {
            console.log("User not found in database, clearing session...");
            authKeys.forEach(key => localStorage.removeItem(key));
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            navigate('/auth');
            toast.error("Please sign in to continue");
            return;
          }
        }

        setIsAuthenticated(true);
        console.log("Authentication check complete - user is authenticated");
      } catch (error: any) {
        console.error("Auth check error:", error);
        // Clear all auth data on error
        Object.keys(localStorage)
          .filter(key => key.startsWith('supabase.auth.'))
          .forEach(key => localStorage.removeItem(key));
        setIsAuthenticated(false);
        navigate('/auth');
        toast.error("Please sign in to continue");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", !!session);
      if (!session) {
        // Clear auth data when session ends
        Object.keys(localStorage)
          .filter(key => key.startsWith('supabase.auth.'))
          .forEach(key => localStorage.removeItem(key));
        navigate('/auth');
        toast.error("Please sign in to continue");
      }
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return children;
};

const App = () => {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <AuthenticationWrapper>
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/auth"
                  element={<Auth />}
                />
                <Route
                  path="/onboarding"
                  element={<Onboarding />}
                />
                <Route
                  element={<DashboardLayout />}
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/post/:postId" element={<PostDetail />} />
                </Route>
              </Routes>
            </AuthenticationWrapper>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </SessionContextProvider>
  );
};

export default App;