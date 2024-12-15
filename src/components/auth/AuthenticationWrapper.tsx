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
        console.log("Initializing authentication wrapper...");
        
        // Check if there's an active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check error:", sessionError);
          throw sessionError;
        }

        // If no session and not on auth page, redirect to auth
        if (!session && !location.pathname.startsWith('/auth')) {
          console.log("No active session, redirecting to auth page");
          navigate('/auth');
        }
        
        // If session exists, check for profile
        if (session?.user) {
          console.log("Session found, checking profile...");
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            // Sign out if profile doesn't exist
            await supabase.auth.signOut();
            queryClient.clear();
            toast.error("Error loading profile. Please sign in again.");
            navigate('/auth');
            return;
          }

          console.log("Profile loaded successfully:", profile);
        }
      } catch (error) {
        console.error("Authentication wrapper error:", error);
        toast.error("An error occurred. Please try again.");
        
        // Clear everything and redirect to auth
        await supabase.auth.signOut();
        queryClient.clear();
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [navigate, queryClient, location.pathname]);

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