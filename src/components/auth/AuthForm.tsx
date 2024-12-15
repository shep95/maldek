import { useState, useEffect, useCallback } from "react";
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

  const handleUsernameCheck = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setIsUsernameTaken(false);
      setIsCheckingUsername(false);
      return;
    }

    console.log("Starting username check for:", username);
    setIsCheckingUsername(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      console.log("Username check response:", { data, error });

      if (error) {
        console.error("Username check error:", error);
        toast.error("Error checking username");
        setIsCheckingUsername(false);
        return;
      }

      setIsUsernameTaken(!!data);
    } catch (error) {
      console.error("Username check error:", error);
      toast.error("Error checking username");
    } finally {
      console.log("Finishing username check, setting isCheckingUsername to false");
      setIsCheckingUsername(false);
    }
  }, []);

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
    console.log("Starting form submission");

    try {
      await onSubmit({
        email,
        password,
        ...(isLogin ? {} : { username }),
      });
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      console.log("Ending form submission");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (!isLogin && username.length >= 3) {
      console.log("Setting timeout for username check");
      timeoutId = setTimeout(() => {
        handleUsernameCheck(username);
      }, 500);
    }

    return () => {
      if (timeoutId) {
        console.log("Clearing username check timeout");
        clearTimeout(timeoutId);
      }
    };
  }, [username, isLogin, handleUsernameCheck]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto px-4">
      <div className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <Input
              type="text"
              placeholder="Username (minimum 3 characters)"
              value={username}
              onChange={(e) => {
                console.log("Username input changed:", e.target.value);
                setUsername(e.target.value);
              }}
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