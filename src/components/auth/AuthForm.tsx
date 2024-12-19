import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AuthFormProps {
  isLogin: boolean;
  onSubmit: (formData: {
    email: string;
    password: string;
    username?: string;
  }) => void;
}

export const AuthForm = ({ isLogin, onSubmit }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUsernameCheck = async (username: string) => {
    if (!username || username.length < 3) {
      setIsUsernameTaken(false);
      setIsCheckingUsername(false);
      return;
    }

    setIsCheckingUsername(true);
    setIsUsernameTaken(false);

    try {
      console.log("Checking username availability:", username);
      const { data, error } = await supabase.rpc(
        'check_username_availability',
        { username_to_check: username }
      );

      if (error) {
        console.error("Username check error:", error);
        toast.error("Error checking username availability");
        return;
      }

      console.log("Username availability result:", { username, isAvailable: data });
      setIsUsernameTaken(!data);
    } catch (error) {
      console.error("Username check failed:", error);
      toast.error("Failed to check username availability");
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || (!isLogin && !username)) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isLogin && isUsernameTaken) {
      toast.error("Username is already taken");
      return;
    }

    setIsSubmitting(true);
    console.log("Starting form submission with username:", username);

    try {
      if (!isLogin) {
        // For signup, handle the auth directly here
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.toLowerCase()
            }
          }
        });

        if (error) throw error;

        // Wait for profile creation with retries
        let retries = 0;
        const maxRetries = 5;
        const checkProfile = async () => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user?.id)
            .single();

          if (profileError || !profile) {
            if (retries < maxRetries) {
              retries++;
              console.log(`Profile not found, retrying... (${retries}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return checkProfile();
            }
            throw new Error('Profile creation failed');
          }
          return profile;
        };

        await checkProfile();
        console.log("Profile created successfully");
        toast.success("Account created successfully! Signing you in...");
        
        // Now handle the login
        await onSubmit({
          email,
          password
        });
      } else {
        // For login, use the provided onSubmit
        await onSubmit({
          email,
          password
        });
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isLogin && username.length >= 3) {
        handleUsernameCheck(username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, isLogin]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto px-4">
      <div className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <Input
              type="text"
              placeholder="Username (minimum 3 characters)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`${
                isUsernameTaken ? "border-red-500" : 
                username.length >= 3 && !isUsernameTaken && !isCheckingUsername ? "border-green-500" : ""
              }`}
              required
              minLength={3}
              disabled={isSubmitting}
            />
            {username.length >= 3 && (
              <div className="absolute right-3 top-3 text-sm">
                {isCheckingUsername ? (
                  <span className="text-muted-foreground">Checking...</span>
                ) : isUsernameTaken ? (
                  <span className="text-red-500">Username taken</span>
                ) : (
                  <span className="text-green-500">Username available</span>
                )}
              </div>
            )}
          </div>
        )}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-muted/50 w-full"
          required
          disabled={isSubmitting}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-muted/50 w-full"
          required
          minLength={6}
          disabled={isSubmitting}
        />
        <Button 
          type="submit" 
          className="w-full bg-accent hover:bg-accent/90 text-white"
          disabled={isSubmitting || (!isLogin && (isCheckingUsername || isUsernameTaken))}
        >
          {isSubmitting ? "Please wait..." : (isLogin ? "Sign in" : "Sign up")}
        </Button>
      </div>
    </form>
  );
};