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

  // Only set up auth listener once
  useEffect(() => {
    if (authListenerSet.current) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.id);
      
      if (event === 'SIGNED_OUT' || !currentSession) {
        navigate('/auth');
      } else if (event === 'SIGNED_IN') {
        console.log('User signed in:', currentSession.user.id);
      }
    });

    // Handle auth errors
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message === 'Failed to fetch' && 
          event.reason?.url?.includes('/auth/v1/user')) {
        console.log('Auth error detected, redirecting to login');
        navigate('/auth');
        toast.error('Session expired. Please sign in again.');
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