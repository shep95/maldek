import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AuthFormProps {
  isLogin: boolean;
  onSubmit: (formData: {
    email: string;
    password: string;
    username?: string;
    bio?: string;
    profilePicture?: File | null;
  }) => void;
}

export const AuthForm = ({ isLogin, onSubmit }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setIsUsernameTaken(false);
        setIsCheckingUsername(false);
        return;
      }

      setIsCheckingUsername(true);
      try {
        console.log("Checking username availability:", username);
        const { data: { available } } = await supabase
          .rpc('check_username_availability', {
            username_to_check: username
          });

        console.log('Username availability result:', { username, available });
        setIsUsernameTaken(!available);
        
        if (!available) {
          toast.error("This username is already taken");
        }
      } catch (error) {
        console.error('Username check error:', error);
        setIsUsernameTaken(false);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout for debouncing
    timeoutId = setTimeout(checkUsername, 500);

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isLogin) {
      if (!username) {
        toast.error("Username is required");
        return;
      }

      if (username.length < 3) {
        toast.error("Username must be at least 3 characters long");
        return;
      }

      if (isUsernameTaken) {
        toast.error("Username is already taken");
        return;
      }
    }

    onSubmit({
      email,
      password,
      username: isLogin ? undefined : username,
      bio: isLogin ? undefined : bio,
      profilePicture: isLogin ? undefined : profilePicture,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Profile picture must be less than 5MB");
        return;
      }
      console.log('Profile picture selected:', file.name);
      setProfilePicture(file);
    }
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
          <>
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
            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profile-picture"
              />
              <label
                htmlFor="profile-picture"
                className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-accent/50 transition-colors"
              >
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
                  <span className="text-xs md:text-sm text-muted-foreground text-center">
                    {profilePicture ? profilePicture.name : "Upload profile picture"}
                  </span>
                </div>
              </label>
            </div>
            <Textarea
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-muted/50 min-h-[100px] w-full"
            />
          </>
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