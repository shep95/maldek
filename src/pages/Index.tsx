import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from '@supabase/auth-helpers-react';

const Index = () => {
  const navigate = useNavigate();
  const session = useSession();

  useEffect(() => {
    console.log("Index: Checking session state:", !!session);
    if (session) {
      console.log("Index: Active session found, redirecting to dashboard");
      navigate("/dashboard");
    } else {
      console.log("Index: No active session, redirecting to auth");
      navigate("/auth");
    }
  }, [session, navigate]);

  return null;
};

export default Index;