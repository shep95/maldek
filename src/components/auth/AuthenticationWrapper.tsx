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
    console.log("AuthenticationWrapper: Session state changed", { 
      hasSession: !!session,
      currentPath: location.pathname 
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", { event, hasSession: !!currentSession });
      
      try {
        if (event === 'SIGNED_OUT') {
          console.log("User signed out, redirecting to auth");
          navigate('/auth');
          return;
        }

        if (event === 'SIGNED_IN') {
          console.log("User signed in, redirecting to dashboard");
          // Add a longer delay to ensure the session is properly initialized
          setTimeout(() => {
            navigate('/dashboard');
          }, 500);
          return;
        }

        // Handle token refresh
        if (event === 'TOKEN_REFRESHED') {
          console.log("Token refreshed successfully");
          return;
        }

        // Handle initial session check
        if (!currentSession && !location.pathname.startsWith('/auth')) {
          console.log("No session found, redirecting to auth");
          navigate('/auth');
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
        toast.error("Session error. Please try signing in again.");
      }
    });

    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Initial session check with retry mechanism
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    let timeoutId: NodeJS.Timeout;

    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        console.log("Initial session check:", { 
          hasSession: !!currentSession,
          attempt: retryCount + 1,
          currentPath: location.pathname
        });

        if (!currentSession && !location.pathname.startsWith('/auth')) {
          if (retryCount < maxRetries) {
            retryCount++;
            timeoutId = setTimeout(checkSession, 1500); // Increased delay between retries
            return;
          }
          console.log("No session found after retries, redirecting to auth");
          navigate('/auth');
        }
      } catch (error) {
        console.error("Session check error:", error);
        if (retryCount < maxRetries) {
          retryCount++;
          timeoutId = setTimeout(checkSession, 1500);
        } else {
          toast.error("Error checking session. Please try signing in again.");
          navigate('/auth');
        }
      }
    };

    checkSession();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [navigate, location.pathname]);

  // If we're on the auth page and there's no session, or if we have a session and we're not on the auth page
  if ((!session && location.pathname.startsWith('/auth')) || (session && !location.pathname.startsWith('/auth'))) {
    console.log("Rendering children", { hasSession: !!session, path: location.pathname });
    return children;
  }

  // Return null while redirecting
  console.log("Returning null while handling auth redirect");
  return null;
};