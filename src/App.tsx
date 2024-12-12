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
        
        // First clear any existing error states
        setIsAuthenticated(null);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          navigate('/auth');
          return;
        }

        if (!session) {
          console.log("No active session found");
          setIsAuthenticated(false);
          navigate('/auth');
          return;
        }

        // Verify the user exists
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("User verification error:", userError);
          // If user doesn't exist, clear the session
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          navigate('/auth');
          toast.error("Session expired. Please sign in again.");
          return;
        }

        if (!user) {
          console.log("No user found");
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          navigate('/auth');
          return;
        }

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          console.error("Profile error or not found:", profileError);
          // If no profile exists, sign out and redirect to auth
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          navigate('/auth');
          toast.error("Account not found. Please sign up.");
          return;
        }

        setIsAuthenticated(true);
        console.log("Authentication check complete - user is authenticated");
      } catch (error) {
        console.error("Auth check error:", error);
        // On any error, clear the session and redirect to auth
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        navigate('/auth');
        toast.error("An error occurred. Please sign in again.");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session);
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        navigate('/auth');
        return;
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAuth();
      }
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