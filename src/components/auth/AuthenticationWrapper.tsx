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

    if (!session && location.pathname !== '/auth') {
      console.log("No session found, redirecting to auth");
      navigate('/auth');
      return;
    }

    if (session && location.pathname === '/auth') {
      console.log("Session found on auth page, redirecting to dashboard");
      navigate('/dashboard');
      return;
    }
  }, [session, navigate, location.pathname]);

  // If we're on the auth page and there's no session, or if we have a session and we're not on the auth page
  if ((!session && location.pathname === '/auth') || (session && location.pathname !== '/auth')) {
    console.log("Rendering children", { hasSession: !!session, path: location.pathname });
    return children;
  }

  // Return null while redirecting
  console.log("Returning null while handling auth redirect");
  return null;
};