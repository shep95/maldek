import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthenticationWrapperProps {
  children: ReactNode;
}

export const AuthenticationWrapper = ({ children }: AuthenticationWrapperProps) => {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const signOutAllUsers = async () => {
      // Only sign out if we're not already on the auth page
      if (location.pathname !== '/auth') {
        try {
          console.log("Signing out all users...");
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error("Error signing out:", error);
            toast.error("Error signing out");
            return;
          }
          console.log("Successfully signed out");
          navigate('/auth');
        } catch (error) {
          console.error("Unexpected error during sign out:", error);
          toast.error("An unexpected error occurred");
        }
      }
    };

    // Sign out all users immediately
    signOutAllUsers();
  }, [navigate, location.pathname]); // Add location.pathname to dependencies

  // If we're on the auth page, render children immediately
  if (location.pathname === '/auth') {
    return children;
  }

  // For other pages, show a loading message while signing out
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">Signing out, please wait...</p>
      </div>
      {children}
    </div>
  );
};