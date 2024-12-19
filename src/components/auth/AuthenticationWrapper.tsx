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
    console.log("AuthenticationWrapper: Initial session check", { 
      hasSession: !!session,
      currentPath: location.pathname 
    });

    // Check initial session
    const checkInitialSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log("Initial session check:", !!currentSession);
    };

    checkInitialSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", { event, hasSession: !!session });
      
      try {
        if (!session && location.pathname !== '/auth') {
          console.log("No session found, redirecting to auth");
          navigate('/auth');
          toast.error("Session expired. Please sign in again.");
        } else if (session && location.pathname === '/auth') {
          console.log("Session found on auth page, redirecting to dashboard");
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
      }
    });

    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
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