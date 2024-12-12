import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";

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