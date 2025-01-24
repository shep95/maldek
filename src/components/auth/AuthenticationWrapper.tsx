import { ReactNode, useEffect, useRef } from 'react';
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
  const authListenerSet = useRef(false);

  // Only set up auth listener once
  useEffect(() => {
    if (authListenerSet.current) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_OUT' && !currentSession) {
        navigate('/auth');
      }
    });

    authListenerSet.current = true;
    return () => {
      subscription.unsubscribe();
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