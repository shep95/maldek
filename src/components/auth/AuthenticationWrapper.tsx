import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AuthenticationWrapperProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export const AuthenticationWrapper = ({ children }: AuthenticationWrapperProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("AuthenticationWrapper mounted, path:", location.pathname);
    
    const handleSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log("Session check result:", session ? "Found session" : "No session");

        // Handle auth page access
        if (location.pathname === '/auth') {
          console.log("On auth page");
          if (session) {
            console.log("User is authenticated, redirecting to dashboard");
            navigate('/dashboard');
          }
          setIsLoading(false);
          return;
        }

        // Handle no session
        if (!session || sessionError) {
          console.log("No valid session, redirecting to auth");
          setIsLoading(false);
          navigate('/auth');
          return;
        }

        // Handle root path
        if (location.pathname === '/') {
          console.log("On root path, redirecting to dashboard");
          setIsLoading(false);
          navigate('/dashboard');
          return;
        }

        console.log("Session found:", session.user.id);
        
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            console.log("Profile not found, creating new profile");
            const { error: createError } = await supabase
              .from('profiles')
              .insert([{
                id: session.user.id,
                username: session.user.email?.split('@')[0] || `user_${Date.now()}`,
                created_at: new Date().toISOString(),
                follower_count: 0
              }]);

            if (createError) {
              console.error("Error creating profile:", createError);
              toast.error("Error creating profile");
              setIsLoading(false);
              return;
            }
            console.log("Profile created successfully");
          } else {
            console.error("Error checking profile:", profileError);
            setIsLoading(false);
            return;
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Session handling error:", error);
        setIsLoading(false);
        navigate('/auth');
      }
    };

    handleSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to auth");
        setIsLoading(false);
        navigate('/auth');
      } else if (event === 'SIGNED_IN') {
        console.log("User signed in, handling session");
        await handleSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};