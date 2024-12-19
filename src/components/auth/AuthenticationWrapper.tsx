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

  // Set up auth listener only once on mount, not on every pathname change
  useEffect(() => {
    console.log("Setting up auth listener with current session:", !!session);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", {
        event,
        currentPath: location.pathname,
        hasSession: !!currentSession,
        sessionExpired: event === 'TOKEN_REFRESHED' && !currentSession
      });

      // Handle only explicit sign-out events
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to auth");
        navigate('/auth');
      }
      
      // Handle token refresh failures
      if (event === 'TOKEN_REFRESHED' && !currentSession) {
        console.log("Session expired, redirecting to auth");
        navigate('/auth');
      }
    });

    return () => {
      console.log("Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, [navigate]); // Remove location.pathname dependency

  // Only protect the auth page from authenticated users
  useEffect(() => {
    if (session && location.pathname === '/auth') {
      console.log("Authenticated user on auth page, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [session, location.pathname, navigate]);

  return children;
};