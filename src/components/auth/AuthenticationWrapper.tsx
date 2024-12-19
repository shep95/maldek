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
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", { 
        event, 
        hasSession: !!currentSession,
        sessionId: currentSession?.access_token?.slice(-10),
        currentPath: location.pathname
      });

      // Only redirect on explicit sign-out or sign-in
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
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Handle initial routing based on session state
  useEffect(() => {
    const handleInitialRoute = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      console.log("Checking route access:", {
        hasSession: !!currentSession,
        currentPath: location.pathname,
        sessionId: currentSession?.access_token?.slice(-10)
      });

      const isAuthPage = location.pathname.startsWith('/auth');
      const isPublicRoute = isAuthPage || location.pathname === '/';

      if (currentSession && isAuthPage) {
        console.log("Authenticated user on auth page, redirecting to dashboard");
        navigate('/dashboard');
      } else if (!currentSession && !isPublicRoute) {
        console.log("Unauthenticated user on protected route, redirecting to auth");
        navigate('/auth');
      }
    };

    handleInitialRoute();
  }, [location.pathname, navigate]);

  return children;
};