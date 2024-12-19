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
    console.log("AuthenticationWrapper initialized", { 
      hasSession: !!session,
      currentPath: location.pathname,
      sessionId: session?.access_token?.slice(-10)
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", { 
        event, 
        hasSession: !!currentSession,
        sessionId: currentSession?.access_token?.slice(-10),
        currentPath: location.pathname
      });

      // Only handle explicit sign-out
      if (event === 'SIGNED_OUT' && !currentSession) {
        console.log("Explicit sign-out detected");
        navigate('/auth');
        return;
      }

      // Handle successful sign-in
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
  }, [navigate]);

  // Only protect routes that require authentication
  const isAuthPage = location.pathname.startsWith('/auth');
  const isPublicRoute = isAuthPage || location.pathname === '/';

  // Only redirect if on auth page with valid session
  if (session && isAuthPage) {
    console.log("Authenticated user on auth page, redirecting to dashboard");
    navigate('/dashboard');
    return null;
  }

  // Only redirect to auth if no session and accessing protected route
  if (!session && !isPublicRoute) {
    console.log("Unauthenticated user accessing protected route, redirecting to auth");
    navigate('/auth');
    return null;
  }

  return children;
};