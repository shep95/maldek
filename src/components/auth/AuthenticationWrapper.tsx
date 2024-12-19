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
    console.log("AuthenticationWrapper: Current session state", { 
      hasSession: !!session,
      currentPath: location.pathname 
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", { event, hasSession: !!currentSession });
      
      if (event === 'SIGNED_OUT') {
        console.log("User explicitly signed out, redirecting to auth");
        navigate('/auth');
        return;
      }

      if (event === 'SIGNED_IN') {
        console.log("User signed in, redirecting to dashboard");
        navigate('/dashboard');
        return;
      }

      // For token refresh, do nothing to prevent unintended redirects
      if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed, maintaining current session");
        return;
      }
    });

    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Only redirect if explicitly on auth page with session, or no session and trying to access protected route
  const isAuthPage = location.pathname.startsWith('/auth');
  const isProtectedRoute = !location.pathname.startsWith('/auth') && location.pathname !== '/';
  
  if (session && isAuthPage) {
    console.log("User has session but on auth page, redirecting to dashboard");
    navigate('/dashboard');
    return null;
  }

  if (!session && isProtectedRoute) {
    console.log("No session and accessing protected route, redirecting to auth");
    navigate('/auth');
    return null;
  }

  console.log("Rendering children", { hasSession: !!session, path: location.pathname });
  return children;
};