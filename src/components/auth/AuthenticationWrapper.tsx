import { ReactNode, useEffect, useRef } from 'react';
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
  const authListenerSet = useRef(false);

  useEffect(() => {
    if (authListenerSet.current) return;
    
    console.log("Setting up auth listener with current session:", !!session);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", {
        event,
        currentPath: location.pathname,
        hasSession: !!currentSession,
      });

      // Only handle explicit sign-out events, ignore token refreshes and other events
      if (event === 'SIGNED_OUT' && !currentSession) {
        console.log("User explicitly signed out, redirecting to auth");
        navigate('/auth');
      }
    });

    authListenerSet.current = true;

    return () => {
      console.log("Cleaning up auth listener");
      subscription.unsubscribe();
      authListenerSet.current = false;
    };
  }, []); // Empty dependency array to ensure listener is only set up once

  // Only protect the auth page from authenticated users
  useEffect(() => {
    if (session && location.pathname === '/auth') {
      console.log("Authenticated user on auth page, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [session, location.pathname, navigate]);

  return children;
};