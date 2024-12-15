import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AuthenticationWrapperProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export const AuthenticationWrapper = ({ children }: AuthenticationWrapperProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First, sign out any existing session
    const signOutExistingSession = async () => {
      try {
        console.log("Signing out existing session...");
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Error signing out:", error);
        }
        // Clear any local storage items related to auth
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.')) {
            localStorage.removeItem(key);
          }
        });
        if (location.pathname !== '/auth') {
          navigate('/auth');
        }
      } catch (error) {
        console.error("Error during sign out:", error);
      }
    };

    signOutExistingSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN') {
        if (!session?.user?.id) {
          console.error("No user ID in session");
          return;
        }

        // Always navigate to dashboard on successful sign in
        navigate('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No active session");
          if (location.pathname !== '/auth') {
            navigate('/auth');
          }
        } else {
          console.log("Active session found:", session.user?.id);
          if (location.pathname === '/auth') {
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        if (location.pathname !== '/auth') {
          navigate('/auth');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};