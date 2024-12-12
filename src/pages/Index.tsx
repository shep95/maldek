import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      console.log("Checking session status...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log("Active session found, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        console.log("No active session, redirecting to auth");
        navigate("/auth", { replace: true });
      }
    };

    checkSession();
  }, [navigate]);

  return null;
};

export default Index;