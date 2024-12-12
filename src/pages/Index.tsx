import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const session = useSession();

  useEffect(() => {
    const checkAndRedirect = async () => {
      console.log("Index: Starting session check");
      
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Index: Session check error:", error);
          navigate("/auth");
          return;
        }

        if (currentSession) {
          console.log("Index: Active session found, redirecting to dashboard");
          navigate("/dashboard", { replace: true });
        } else {
          console.log("Index: No active session, redirecting to auth");
          navigate("/auth", { replace: true });
        }
      } catch (error) {
        console.error("Index: Error checking session:", error);
        navigate("/auth", { replace: true });
      }
    };

    checkAndRedirect();
  }, [navigate]);

  // Don't rely solely on useSession hook as it might be delayed
  useEffect(() => {
    if (session) {
      console.log("Index: Session hook detected active session");
      navigate("/dashboard", { replace: true });
    }
  }, [session, navigate]);

  return null;
};

export default Index;