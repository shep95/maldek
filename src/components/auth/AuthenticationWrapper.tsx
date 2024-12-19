import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthenticationWrapperProps {
  children: ReactNode;
}

export const AuthenticationWrapper = ({ children }: AuthenticationWrapperProps) => {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("AuthenticationWrapper: Session state changed", { 
      hasSession: !!session,
      currentPath: location.pathname 
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", { event, hasSession: !!currentSession });
      
      try {
        if (event === 'SIGNED_OUT') {
          console.log("User signed out, redirecting to auth");
          navigate('/auth');
          return;
        }

        if (event === 'SIGNED_IN') {
          console.log("User signed in, redirecting to dashboard");
          navigate('/dashboard');
          return;
        }

        // Handle token refresh
        if (event === 'TOKEN_REFRESHED') {
          console.log("Token refreshed successfully");
          return;
        }

        // Handle initial session check
        if (!currentSession && location.pathname !== '/auth') {
          console.log("No session found, redirecting to auth");
          navigate('/auth');
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
        toast.error("Session error. Please try signing in again.");
      }
    });

    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Initial session check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log("Initial session check:", { hasSession: !!currentSession });

      if (!currentSession && location.pathname !== '/auth') {
        console.log("No initial session found, redirecting to auth");
        navigate('/auth');
      }
    };

    checkSession();
  }, [navigate, location.pathname]);

  // If we're on the auth page and there's no session, or if we have a session and we're not on the auth page
  if ((!session && location.pathname === '/auth') || (session && location.pathname !== '/auth')) {
    console.log("Rendering children", { hasSession: !!session, path: location.pathname });
    return children;
  }

  // Return null while redirecting
  console.log("Returning null while handling auth redirect");
  return null;
};