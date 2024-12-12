import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkUsername = async (username: string) => {
    if (username.length < 3) return;
    
    setIsCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);

      if (error) {
        console.error('Error checking username:', error);
        return;
      }

      setIsUsernameTaken(data && data.length > 0);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    checkUsername(newUsername);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const uploadProfilePicture = async (userId: string) => {
    if (!profilePicture) return null;

    const fileExt = profilePicture.name.split('.').pop();
    const filePath = `${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, profilePicture, {
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading profile picture:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && isUsernameTaken) {
      toast({
        title: "Username taken",
        description: "Please choose a different username",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        navigate("/dashboard");
      } else {
        console.log('Starting signup process...');
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) throw signUpError;

        if (data.user) {
          console.log('User created successfully, uploading profile picture...');
          let avatarUrl = null;

          if (profilePicture) {
            const fileExt = profilePicture.name.split('.').pop();
            const filePath = `${data.user.id}.${fileExt}`;

            console.log('Uploading profile picture to storage...');
            const { error: uploadError, data: uploadData } = await supabase.storage
              .from('avatars')
              .upload(filePath, profilePicture, {
                upsert: true
              });

            if (uploadError) {
              console.error('Profile picture upload error:', uploadError);
              throw uploadError;
            }

            console.log('Profile picture uploaded successfully');
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);
            
            avatarUrl = publicUrl;
          }

          console.log('Creating profile entry...');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                username: username,
                bio: bio,
                avatar_url: avatarUrl,
                follower_count: 0
              }
            ]);

          if (profileError) {
            console.error('Profile creation error:', profileError);
            throw profileError;
          }

          console.log('Profile created successfully');
          navigate("/onboarding");
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-accent">Maldek</h2>
          <p className="mt-2 text-sm text-muted-foreground">Next generation of social media</p>
        </div>

        <Card className="mx-4 border border-muted bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl md:text-3xl">{isLogin ? "Welcome back" : "Create account"}</CardTitle>
            <CardDescription>
              {isLogin ? "Enter your credentials to continue" : "Fill in your details to get started"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/50"
                />
              </div>
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={handleUsernameChange}
                      className={`bg-muted/50 ${
                        isUsernameTaken ? "border-red-500" : username.length >= 3 ? "border-green-500" : ""
                      }`}
                    />
                    {username.length >= 3 && (
                      <p className={`text-sm ${isUsernameTaken ? "text-red-500" : "text-green-500"}`}>
                        {isCheckingUsername
                          ? "Checking username..."
                          : isUsernameTaken
                          ? "Username is already taken"
                          : "Username is available"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
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
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {profilePicture ? profilePicture.name : "Upload profile picture"}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Tell us about yourself..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="bg-muted/50 min-h-[100px]"
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/50"
                />
              </div>
              {!isLogin && (
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-muted/50"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-white"
                disabled={!isLogin && isUsernameTaken}
              >
                {isLogin ? "Sign in" : "Sign up"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground hover:text-white hover:border hover:border-white hover:bg-transparent"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
