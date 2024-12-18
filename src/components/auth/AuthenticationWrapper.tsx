import { ReactNode, useEffect, useState } from 'react';
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
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      console.log("AuthenticationWrapper: Checking session and profile", { 
        hasSession: !!session,
        currentPath: location.pathname 
      });

      if (!session) {
        if (location.pathname !== '/auth') {
          console.log("No session found, redirecting to auth");
          navigate('/auth');
        }
        setIsCheckingProfile(false);
        return;
      }

      try {
        // Check if profile exists
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('id', session.user.id)
          .single();

        console.log("Profile check result:", { profile, error });

        if (error) {
          console.error("Error checking profile:", error);
          toast.error("Error checking profile status");
          return;
        }

        if (!profile) {
          console.log("No profile found, waiting for creation...");
          // Wait a moment for the trigger to create the profile
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check again
          const { data: retryProfile, error: retryError } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('id', session.user.id)
            .single();

          if (retryError || !retryProfile) {
            console.error("Profile still not found after retry");
            toast.error("Error loading profile");
            return;
          }
        }

        // If we're on auth page and have both session and profile, redirect to dashboard
        if (location.pathname === '/auth') {
          console.log("Session and profile found on auth page, redirecting to dashboard");
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error in profile check:", error);
        toast.error("Error checking profile status");
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfileAndRedirect();
  }, [session, navigate, location.pathname]);

  // Show loading state while checking profile
  if (isCheckingProfile) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
    </div>;
  }

  // If we're on the auth page and there's no session, or if we have a session and we're not on the auth page
  if ((!session && location.pathname === '/auth') || (session && location.pathname !== '/auth')) {
    console.log("Rendering children", { hasSession: !!session, path: location.pathname });
    return children;
  }

  // Return null while redirecting
  console.log("Returning null while handling auth redirect");
  return null;
};