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
    };

    // Sign out all users immediately
    signOutAllUsers();
  }, []); // Empty dependency array to run only once

  return children; // Return children instead of null to prevent black screen
};