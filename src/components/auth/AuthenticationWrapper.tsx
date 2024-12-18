import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from "sonner";

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

    // Only redirect if we're not already on the auth page
    if (!session && location.pathname !== '/auth') {
      console.log("No session found, redirecting to auth");
      navigate('/auth');
      return;
    }

    // Only redirect if we have a session and we're on the auth page
    if (session && location.pathname === '/auth') {
      console.log("Session found on auth page, redirecting to dashboard");
      navigate('/dashboard');
      return;
    }
  }, [session, navigate, location.pathname]);

  // Always render children to avoid black screen
  return children;
};