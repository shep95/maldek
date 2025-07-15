
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const checkSession = async () => {
      try {
        console.log("Checking session status...");
        setIsLoading(true);
        
        // Add timeout for session check to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session check timeout')), 10000);
        });
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (error) {
          console.error("Session check error:", error);
          // Don't show error toast for timeout, just redirect
          if (!error.message?.includes('timeout')) {
            toast.error("Failed to check login status. Please try again.");
          }
          navigate("/auth", { replace: true });
          return;
        }
        
        if (session) {
          console.log("Active session found, redirecting to dashboard");
          navigate("/dashboard", { replace: true });
        } else {
          console.log("No active session, redirecting to auth");
          navigate("/auth", { replace: true });
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        // For scale, redirect gracefully instead of showing error
        navigate("/auth", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  // Show loading skeleton while checking session or if not mounted
  if (isLoading || !isMounted) {
    return (
      <div className="min-h-screen min-h-screen-dynamic flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback UI in case navigation fails
  return (
    <div className="min-h-screen min-h-screen-dynamic flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">Welcome to Maldek</h1>
        <p className="text-muted-foreground">Redirecting you to the app...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
        <div className="space-y-2">
          <button 
            onClick={() => navigate("/auth", { replace: true })}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </button>
          <button 
            onClick={() => navigate("/dashboard", { replace: true })}
            className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
