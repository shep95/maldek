
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session status...");
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          toast.error("Failed to check login status. Please try again.");
          return;
        }
        
        if (session) {
          console.log("Active session found, redirecting to dashboard");
          navigate("/dashboard", { replace: true });
          return;
        } else {
          console.log("No active session");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("Something went wrong. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleNavigateToSpaces = () => {
    navigate("/spaces");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Spaces</CardTitle>
          <CardDescription>
            Connect with others through live audio conversations and much more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            Please log in to access the full application with dashboard, spaces, messages, and more.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleLogin} className="w-full">
              Log In / Sign Up
            </Button>
            <Button onClick={handleNavigateToSpaces} variant="outline" className="w-full">
              Browse Public Spaces
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
