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
    
    const handleAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session?.user?.id);

        if (!session?.user?.id) {
          console.log("No active session, redirecting to auth");
          if (location.pathname !== '/auth') {
            navigate('/auth');
          }
          setIsLoading(false);
          return;
        }

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Don't redirect to auth if profile fetch fails
          setIsLoading(false);
          return;
        }

        if (!profile) {
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
            setIsLoading(false);
            return;
          }
        }

        // If we're on the auth page and have a valid session, redirect to dashboard
        if (location.pathname === '/auth') {
          console.log("Valid session found, redirecting to dashboard");
          navigate('/dashboard');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Auth handling error:", error);
        setIsLoading(false);
      }
    };

    handleAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN') {
        if (!session?.user?.id) {
          console.error("No user ID in session");
          return;
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