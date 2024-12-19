import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';

interface AuthenticationWrapperProps {
  children: ReactNode;
}

export const AuthenticationWrapper = ({ children }: AuthenticationWrapperProps) => {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log("Initial session check:", { 
        hasSession: !!currentSession,
        sessionId: currentSession?.access_token?.slice(-10),
        currentPath: location.pathname
      });

      // If we have a session but we're on the auth page, redirect to dashboard
      if (currentSession && location.pathname.startsWith('/auth')) {
        navigate('/dashboard');
        return;
      }

      // If we don't have a session and we're not on a public route, redirect to auth
      if (!currentSession && !location.pathname.startsWith('/auth') && location.pathname !== '/') {
        navigate('/auth');
        return;
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", { 
        event, 
        hasSession: !!currentSession,
        sessionId: currentSession?.access_token?.slice(-10),
        currentPath: location.pathname
      });

      if (event === 'SIGNED_OUT') {
        console.log("Explicit sign-out detected");
        navigate('/auth');
        return;
      }

      if (event === 'SIGNED_IN' && currentSession) {
        console.log("Sign-in successful, redirecting to dashboard");
        navigate('/dashboard');
        return;
      }

      // For token refresh and other events, maintain the current session
      if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed, maintaining session");
        return;
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Don't render anything during the initial session check
  if (typeof session === 'undefined') {
    console.log("Session is undefined, waiting for initialization");
    return null;
  }

  return children;
};