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
    // Only set up listener for explicit sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed:", event);

      // Only redirect on explicit sign-out
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
    const isAuthPage = location.pathname === '/auth';
    
    if (session && isAuthPage) {
      console.log("Authenticated user on auth page, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [session, location.pathname, navigate]);

  return children;
};