import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AuthenticationWrapperProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export const AuthenticationWrapper = ({ children, queryClient }: AuthenticationWrapperProps) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  const clearAuthState = async () => {
    if (isClearing) return;
    
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
      toast.success("Session cleared. Please sign in again.");
    } catch (error) {
      console.error("Error clearing auth state:", error);
      toast.error("Error clearing session. Please refresh the page.");
      // Even if there's an error, we want to reset the state
      setIsAuthenticated(false);
      navigate('/auth');
    } finally {
      setIsLoading(false);
      setIsClearing(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkAuth = async () => {
      if (isClearing) return;

      try {
        console.log("Starting authentication check...");
        if (mounted) setIsLoading(true);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          await clearAuthState();
          return;
        }

        if (!session) {
          console.log("No active session found");
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          navigate('/auth');
          return;
        }

        // Verify the user exists
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("User verification error:", userError);
          await clearAuthState();
          return;
        }

        if (mounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
        console.log("Authentication check complete - user is authenticated");
      } catch (error) {
        console.error("Auth check error:", error);
        await clearAuthState();
      }
    };

    // Initial auth check
    checkAuth();

    // Set up timeout to clear auth state if loading persists
    timeoutId = setTimeout(() => {
      if (isLoading && mounted) {
        console.log("Forcing auth state clear due to timeout");
        clearAuthState();
      }
    }, 5000); // 5 second timeout

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
      mounted = false;
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="text-muted-foreground">
            {isClearing ? "Clearing session..." : "Loading your profile..."}
          </p>
          <button
            onClick={clearAuthState}
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            Click here if loading takes too long
          </button>
        </div>
      </div>
    );
  }

  return children;
};