import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthenticationWrapperProps {
  children: React.ReactNode;
}

export const AuthenticationWrapper = ({ children }: AuthenticationWrapperProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("AuthenticationWrapper mounted, signing out all users");
    
    const signOutAllUsers = async () => {
      try {
        // Clear all Supabase-related items from localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.')) {
            localStorage.removeItem(key);
          }
        });

        // Force sign out through Supabase
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Error signing out:", error);
          toast.error("Error signing out");
        } else {
          console.log("Successfully signed out all users");
          navigate('/auth');
        }
      } catch (error) {
        console.error("Error in sign out process:", error);
        toast.error("Error signing out");
      } finally {
        setIsLoading(false);
      }
    };

    signOutAllUsers();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="text-muted-foreground">Signing out...</p>
        </div>
      </div>
    );
  }

  return children;
};