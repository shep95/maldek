import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const session = useSession();

  useEffect(() => {
    const handleNavigation = async () => {
      try {
        console.log("Index page loaded, checking session state");
        
        if (session) {
          console.log("Active session found, redirecting to dashboard");
          navigate("/dashboard");
        } else {
          console.log("No active session, redirecting to auth page");
          navigate("/auth");
        }
      } catch (error) {
        console.error("Navigation error:", error);
        toast.error("An error occurred. Please try refreshing the page.");
        navigate("/auth");
      }
    };

    handleNavigation();
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-foreground">
        Loading...
      </div>
    </div>
  );
};

export default Index;