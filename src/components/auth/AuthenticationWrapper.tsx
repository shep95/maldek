import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";

interface AuthenticationWrapperProps {
  children: ReactNode;
}

export const AuthenticationWrapper = ({ children }: AuthenticationWrapperProps) => {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      console.log("AuthenticationWrapper: Checking session state", { 
        hasSession: !!session,
        currentPath: location.pathname 
      });

      // Get the current session state
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        if (location.pathname !== '/auth') {
          console.log("No active session, redirecting to auth");
          navigate('/auth');
        }
        return;
      }

      // If we have a session and we're on the auth page, redirect to dashboard
      if (currentSession && location.pathname === '/auth') {
        console.log("Active session found on auth page, redirecting to dashboard");
        navigate('/dashboard');
      }
    };

    checkSession();
  }, [session, navigate, location.pathname]);

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session);
      
      if (event === 'SIGNED_IN') {
        console.log("User signed in, checking profile");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return children;
};