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
    console.log("AuthenticationWrapper mounted", { 
      hasSession: !!session,
      currentPath: location.pathname 
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", { event, hasSession: !!currentSession });

      // Only handle explicit sign-out events
      if (event === 'SIGNED_OUT' && !currentSession) {
        console.log("User explicitly signed out");
        navigate('/auth');
        return;
      }

      // Handle successful sign-in
      if (event === 'SIGNED_IN' && currentSession) {
        console.log("User successfully signed in");
        navigate('/dashboard');
        return;
      }

      // For all other events (like token refresh), maintain the current session
      console.log("Maintaining current session state for event:", event);
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Handle initial route protection
  const isAuthPage = location.pathname.startsWith('/auth');
  const isProtectedRoute = !isAuthPage && location.pathname !== '/';

  // If user has session but is on auth page, redirect to dashboard
  if (session && isAuthPage) {
    console.log("Redirecting authenticated user from auth page to dashboard");
    navigate('/dashboard');
    return null;
  }

  // If no session and trying to access protected route, redirect to auth
  if (!session && isProtectedRoute) {
    console.log("Redirecting unauthenticated user to auth page");
    navigate('/auth');
    return null;
  }

  // Render children for all other cases
  return children;
};