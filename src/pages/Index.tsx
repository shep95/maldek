import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const session = useSession();
  const [isLoading, setIsLoading] = useState(true);

  const handleClearSession = async () => {
    try {
      console.log("Manually clearing session...");
      // Clear all Supabase-related items from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key);
        }
      });
      
      await supabase.auth.signOut({ scope: 'global' });
      navigate("/auth");
      toast.success("Session cleared. Please sign in again.");
    } catch (error) {
      console.error("Error clearing session:", error);
      toast.error("Error clearing session. Please refresh the page.");
      navigate("/auth");
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Loading timeout reached, redirecting to auth...");
        handleClearSession();
      }
    }, 3000); // 3 second timeout

    const checkSession = async () => {
      try {
        console.log("Checking session state...");
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          navigate("/auth");
          return;
        }

        if (currentSession) {
          console.log("Active session found, redirecting to dashboard");
          navigate("/dashboard");
        } else {
          console.log("No active session, redirecting to auth");
          navigate("/auth");
        }
      } catch (error) {
        console.error("Session check failed:", error);
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
    return () => clearTimeout(timeoutId);
  }, [navigate, session]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        <p className="text-muted-foreground">Loading...</p>
        <Button 
          variant="ghost" 
          onClick={handleClearSession}
          className="text-sm text-accent hover:text-accent/80 transition-colors"
        >
          Click here if loading takes too long
        </Button>
      </div>
    );
  }

  return null;
};

export default Index;