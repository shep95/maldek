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
    console.log("AuthenticationWrapper mounted");
    
    const clearAuthData = async () => {
      console.log("Clearing auth data...");
      setIsLoading(true);
      
      // Clear all Supabase auth data from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          console.log("Removing auth data:", key);
          localStorage.removeItem(key);
        }
      });

      // Force sign out from Supabase
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Sign out error:", error);
          toast.error("Error signing out");
        } else {
          console.log("Successfully signed out");
        }
      } catch (error) {
        console.error("Error during sign out:", error);
        toast.error("Error signing out");
      }

      // Force navigation to auth page
      navigate('/auth');
      setIsLoading(false);
    };

    // Execute clear auth data
    clearAuthData();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to auth");
        navigate('/auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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