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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("Checking authentication status...");
        const { data: { session } } = await supabase.auth.getSession();

        // If no session and not on auth page, redirect to auth
        if (!session && !location.pathname.startsWith('/auth')) {
          console.log("No session found, redirecting to auth");
          navigate('/auth');
          return;
        }

        // If we have a session, attempt to get or create profile
        if (session?.user) {
          console.log("Session found, checking profile");
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          // If profile doesn't exist, try to create it but don't block access
          if (profileError && profileError.code === 'PGRST116') {
            console.log("Profile not found, attempting to create");
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                username: session.user.email?.split('@')[0] || `user_${Date.now()}`
              });

            if (createError) {
              console.error("Error creating profile:", createError);
              toast.error("Profile setup incomplete, but you can still use the app");
            }
          }

          // Always redirect to dashboard if on auth page with valid session
          if (location.pathname.startsWith('/auth')) {
            console.log("Valid session found, redirecting to dashboard");
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
        toast.error("Some features might be limited, but you can continue using the app");
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN') {
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