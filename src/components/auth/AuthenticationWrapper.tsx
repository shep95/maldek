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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("AuthenticationWrapper mounted");
    
    const clearAuthData = async () => {
      // Only clear auth data if we're not already on the auth page
      if (location.pathname !== '/auth') {
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
      }
    };

    clearAuthData();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN') {
        if (!session?.user?.id) {
          console.error("No user ID in session");
          return;
        }

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          console.log("No profile found, creating one...");
          const { error: createError } = await supabase
            .from('profiles')
            .insert([{ 
              id: session.user.id,
              username: session.user.email?.split('@')[0] || `user_${Date.now()}`
            }]);

          if (createError) {
            console.error("Error creating profile:", createError);
            toast.error("Error creating profile");
            return;
          }
        }

        navigate('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

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