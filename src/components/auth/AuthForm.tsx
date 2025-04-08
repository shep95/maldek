
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// List of known disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  "mailinator.com", "guerrillamail.com", "temp-mail.org", "fakeinbox.com", "tempmail.com",
  "10minutemail.com", "yopmail.com", "getairmail.com", "mailnesia.com", "mailcatch.com",
  "trashmail.com", "sharklasers.com", "guerrillamail.org", "disposableinbox.com", "tempinbox.com",
  "dispostable.com", "mailinator.net", "mailinator.org", "33mail.com", "meltmail.com",
  "mintemail.com", "maildrop.cc", "emailondeck.com", "spamgourmet.com", "getnada.com",
  "tempr.email", "temp-mail.io", "tempmailo.com", "throwawaymail.com", "wegwerfmail.de",
  "burnermail.io", "spambox.us", "mailnull.com", "incognitomail.com", "tempinbox.net",
  "instantemailaddress.com", "tempmail.ninja", "fakemail.net"
];

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
  const [isDisposableEmail, setIsDisposableEmail] = useState(false);

  const checkIfDisposableEmail = (email: string) => {
    if (!email || !email.includes('@')) return false;
    
    const domain = email.split('@')[1].toLowerCase();
    return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsDisposableEmail(checkIfDisposableEmail(newEmail));
  };

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
        { username_to_check: username.toLowerCase() }
      );

      if (error) {
        console.error("Username check error:", error);
        toast.error("Error checking username availability");
        return;
      }

      console.log("Username availability result:", { username, isAvailable: data });
      setIsUsernameTaken(!data); // data is true if username is available
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

    if (!isLogin && isDisposableEmail) {
      toast.error("Please use a permanent email address. Temporary or disposable email addresses are not allowed.");
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

        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast.success("Account created successfully! You can now sign in.");
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
        <div className="relative">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            className={`bg-muted/50 w-full ${isDisposableEmail ? "border-red-500" : ""}`}
            required
            disabled={isSubmitting}
          />
          {isDisposableEmail && (
            <div className="text-xs text-red-500 mt-1">
              Temporary email addresses are not allowed.
            </div>
          )}
        </div>
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
          disabled={isSubmitting || (!isLogin && (isCheckingUsername || isUsernameTaken || isDisposableEmail))}
        >
          {isSubmitting ? "Please wait..." : (isLogin ? "Sign in" : "Sign up")}
        </Button>
      </div>
    </form>
  );
};
