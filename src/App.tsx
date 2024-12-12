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
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  const clearAuthState = async () => {
    if (isClearing) return; // Prevent multiple simultaneous clear operations
    
    try {
      console.log("Clearing auth state...");
      setIsClearing(true);
      setIsLoading(true);
      
      // Clear all Supabase-related items from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key);
        }
      });

      // Force clear the session with global scope
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear React Query cache
      queryClient.clear();
      
      setIsAuthenticated(false);
      navigate('/auth');
      
      console.log("Auth state cleared successfully");
    } catch (error) {
      console.error("Error clearing auth state:", error);
      // Even if there's an error, we want to reset the state
      setIsAuthenticated(false);
      navigate('/auth');
    } finally {
      setIsLoading(false);
      setIsClearing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (isClearing) return; // Don't check auth while clearing

      try {
        console.log("Starting authentication check...");
        if (isMounted) setIsLoading(true);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          await clearAuthState();
          return;
        }

        if (!session) {
          console.log("No active session found");
          if (isMounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        // Verify the user exists
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("User verification error:", userError);
          await clearAuthState();
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
          await clearAuthState();
          return;
        }

        if (isMounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
        console.log("Authentication check complete - user is authenticated");
      } catch (error) {
        console.error("Auth check error:", error);
        await clearAuthState();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session);
      
      if (event === 'SIGNED_OUT') {
        if (!isClearing) {
          await clearAuthState();
        }
        return;
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAuth();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
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