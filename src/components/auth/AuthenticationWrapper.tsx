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
    // Set up auth state change listener only for explicit sign-out/sign-in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", { 
        event, 
        hasSession: !!currentSession,
        sessionId: currentSession?.access_token?.slice(-10),
        currentPath: location.pathname
      });

      // Only handle explicit sign-out
      if (event === 'SIGNED_OUT') {
        console.log("User explicitly signed out, redirecting to auth");
        navigate('/auth');
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Only protect the auth page from authenticated users
  useEffect(() => {
    const isAuthPage = location.pathname.startsWith('/auth');
    
    if (session && isAuthPage) {
      console.log("Authenticated user on auth page, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [session, location.pathname, navigate]);

  return children;
};