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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN') {
        if (!session?.user?.id) {
          console.error("No user ID in session");
          return;
        }

        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.log("Creating new profile for user:", session.user.id);
            const { error: createError } = await supabase
              .from('profiles')
              .insert([{
                id: session.user.id,
                username: session.user.email?.split('@')[0] || `user_${Math.random().toString(36).slice(2, 7)}`,
              }]);

            if (createError) {
              console.error("Profile creation error:", createError);
              // Continue anyway - user can still use the app
            }
          }

          // Always navigate to dashboard on successful sign in
          navigate('/dashboard');
        } catch (error) {
          console.error("Error during profile check:", error);
          // Continue anyway - user can still use the app
          navigate('/dashboard');
        }
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
          navigate('/dashboard');
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