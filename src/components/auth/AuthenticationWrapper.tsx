import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AuthenticationWrapperProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export const AuthenticationWrapper = ({ children, queryClient }: AuthenticationWrapperProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Starting authentication check...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setIsAuthenticated(false);
          if (!location.pathname.startsWith('/auth')) {
            navigate('/auth', { replace: true });
          }
          return;
        }

        if (!session) {
          console.log("No active session found");
          setIsAuthenticated(false);
          if (!location.pathname.startsWith('/auth')) {
            navigate('/auth', { replace: true });
          }
          return;
        }

        console.log("Valid session found");
        setIsAuthenticated(true);
        if (location.pathname === '/auth') {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        if (!location.pathname.startsWith('/auth')) {
          navigate('/auth', { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session ended");
        setIsAuthenticated(false);
        queryClient.clear();
        navigate('/auth', { replace: true });
        return;
      }
      
      if (event === 'SIGNED_IN') {
        console.log("User signed in");
        setIsAuthenticated(true);
        navigate('/dashboard', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, queryClient]);

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