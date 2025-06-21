
import { ReactNode, useEffect, useRef } from 'react';
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
  const authListenerSet = useRef(false);
  const errorCount = useRef(0);
  const maxErrors = 5;

  // Only set up auth listener once
  useEffect(() => {
    if (authListenerSet.current) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.id);
      
      if (event === 'SIGNED_OUT' || !currentSession) {
        errorCount.current = 0; // Reset error count on signout
        navigate('/auth');
      } else if (event === 'SIGNED_IN') {
        console.log('User signed in:', currentSession.user.id);
        errorCount.current = 0; // Reset error count on successful signin
      }
    });

    // Enhanced error handling with circuit breaker pattern
    const handleUnhandledRejection = async (event: PromiseRejectionEvent) => {
      const isAuthError = event.reason?.message === 'Failed to fetch' && 
                         event.reason?.url?.includes('/auth/v1/user');
      
      if (isAuthError) {
        errorCount.current++;
        console.log(`Auth error detected (${errorCount.current}/${maxErrors}), attempting to refresh session`);
        
        // Implement circuit breaker - if too many errors, stop trying
        if (errorCount.current >= maxErrors) {
          console.log('Too many auth errors, redirecting to login');
          navigate('/auth');
          toast.error('Connection issues detected. Please sign in again.');
          return;
        }
        
        try {
          const { data: { session: currentSession }, error: refreshError } = await supabase.auth.getSession();
          
          if (refreshError || !currentSession) {
            console.log('Session refresh failed, redirecting to login');
            navigate('/auth');
            if (errorCount.current === 1) { // Only show toast on first error
              toast.error('Session expired. Please sign in again.');
            }
          } else {
            console.log('Session refreshed successfully');
            errorCount.current = Math.max(0, errorCount.current - 1); // Reduce error count on success
          }
        } catch (error) {
          console.error('Error refreshing session:', error);
          if (errorCount.current >= maxErrors) {
            navigate('/auth');
            toast.error('Session expired. Please sign in again.');
          }
        }
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    authListenerSet.current = true;
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      authListenerSet.current = false;
    };
  }, [navigate]);

  // Simple redirect for authenticated users on auth page
  useEffect(() => {
    if (session && location.pathname === '/auth') {
      navigate('/dashboard');
    }
  }, [session, location.pathname, navigate]);

  return children;
};
