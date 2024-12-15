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
    const init = async () => {
      try {
        // First, sign out any existing session
        await supabase.auth.signOut();
        console.log("Signed out any existing session");
        
        // Clear query cache
        queryClient.clear();
        
        // Reset state
        setIsAuthenticated(false);
        
        // Redirect to auth page
        if (!location.pathname.startsWith('/auth')) {
          navigate('/auth');
        }
      } catch (error) {
        console.error("Error during initialization:", error);
        toast.error("An error occurred during initialization");
      } finally {
        setIsLoading(false);
      }
    };

    // Run initialization
    init();
  }, [navigate, queryClient]);

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