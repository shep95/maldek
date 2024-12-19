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

  // Only handle explicit sign-out events and session expiration
  useEffect(() => {
    console.log("Setting up auth listener with current session:", !!session);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", {
        event,
        currentPath: location.pathname,
        hasSession: !!currentSession,
        sessionExpired: event === 'TOKEN_REFRESHED' && !currentSession
      });

      // Only redirect on explicit sign-out button click or if session is truly expired
      if (event === 'SIGNED_OUT' && location.pathname !== '/auth') {
        console.log("User clicked sign out, redirecting to auth");
        navigate('/auth');
      }
    });

    return () => {
      console.log("Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Only protect the auth page from authenticated users
  useEffect(() => {
    if (session && location.pathname === '/auth') {
      console.log("Authenticated user on auth page, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [session, location.pathname, navigate]);

  return children;
};