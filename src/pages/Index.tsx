import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const session = useSession();

  useEffect(() => {
    console.log("Index page loaded, checking session:", session);
    
    if (session) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate("/dashboard");
    } else {
      console.log("No session found, redirecting to auth");
      navigate("/auth");
    }
  }, [session, navigate]);

  // Show a loading state while checking authentication
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">Redirecting...</div>
    </div>
  );
};

export default Index;