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

  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setIsUsernameTaken(false);
        return;
      }

      setIsCheckingUsername(true);
      try {
        console.log("Checking username availability:", username);
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .maybeSingle();

        if (error) {
          console.error('Username check error:', error);
          return;
        }

        const isTaken = !!data;
        console.log('Username check result:', { username, isTaken });
        setIsUsernameTaken(isTaken);
      } catch (error) {
        console.error('Username check error:', error);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const debounceTimer = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounceTimer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isLogin && !username) {
      toast.error("Username is required");
      return;
    }

    if (!isLogin && username.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    if (!isLogin && isUsernameTaken) {
      toast.error("Username is already taken");
      return;
    }

    onSubmit({
      email,
      password,
      username: isLogin ? undefined : username,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto px-4">
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-muted/50 w-full"
          required
        />
        {!isLogin && (
          <div className="relative">
            <Input
              type="text"
              placeholder="Username (minimum 3 characters)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`bg-muted/50 w-full ${
                isUsernameTaken ? "border-red-500" : 
                username.length >= 3 && !isUsernameTaken ? "border-green-500" : ""
              }`}
              required
              minLength={3}
            />
            {username.length >= 3 && (
              <div className="absolute right-3 top-3 text-xs md:text-sm">
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
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-muted/50 w-full"
          required
          minLength={6}
        />
        <Button 
          type="submit" 
          className="w-full bg-accent hover:bg-accent/90 text-white"
          disabled={!isLogin && (isUsernameTaken || isCheckingUsername)}
        >
          {isLogin ? "Sign in" : "Sign up"}
        </Button>
      </div>
    </form>
  );
};