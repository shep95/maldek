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

  // Only handle explicit sign-out events
  useEffect(() => {
    console.log("Setting up auth listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed:", {
        event,
        currentPath: location.pathname,
        hasSession: !!session
      });

      // Only redirect on explicit sign-out button click
      if (event === 'SIGNED_OUT') {
        console.log("User clicked sign out, redirecting to auth");
        navigate('/auth');
      }
    });

    return () => {
      console.log("Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Only protect the auth page from authenticated users
  useEffect(() => {
    if (session && location.pathname === '/auth') {
      console.log("Authenticated user on auth page, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [session, location.pathname, navigate]);

  return children;
};