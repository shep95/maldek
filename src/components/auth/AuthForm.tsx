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

  const handleUsernameCheck = async (username: string) => {
    if (!username || username.length < 3) {
      setIsUsernameTaken(false);
      setIsCheckingUsername(false);
      return;
    }

    console.log('Checking username:', username);
    setIsCheckingUsername(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        console.error('Username check error:', error);
        toast.error('Error checking username availability');
        return;
      }

      console.log('Username check result:', { username, isTaken: !!data });
      setIsUsernameTaken(!!data);
    } catch (error) {
      console.error('Username check error:', error);
      toast.error('Error checking username availability');
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

    onSubmit({
      email,
      password,
      ...(isLogin ? {} : { username }),
    });
  };

  // Debounce username check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isLogin && username) {
        handleUsernameCheck(username);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [username, isLogin]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto px-4">
      <div className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`${
                isUsernameTaken ? "border-red-500" : 
                username.length >= 3 && !isUsernameTaken ? "border-green-500" : ""
              }`}
              required
              minLength={3}
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
        />
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
        >
          {isLogin ? "Sign in" : "Sign up"}
        </Button>
      </div>
    </form>
  );
};