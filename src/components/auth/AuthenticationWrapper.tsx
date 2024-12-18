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

      // Check if profile exists for the user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();

      console.log("Profile check result:", { profile, profileError });

      // If we have a session and we're on the auth page, redirect to dashboard
      // Only redirect if we have both a session and a profile
      if (currentSession && location.pathname === '/auth' && profile) {
        console.log("Active session and profile found on auth page, redirecting to dashboard");
        navigate('/dashboard');
      }
    };

    checkSession();
  }, [session, navigate, location.pathname]);

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in, checking profile");
        
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          console.log("Profile found after sign in, redirecting to dashboard");
          navigate('/dashboard');
        } else {
          console.log("No profile found after sign in, waiting for creation");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return children;
};