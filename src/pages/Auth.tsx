import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (formData: {
    email: string;
    password: string;
    username?: string;
    bio?: string;
    profilePicture?: File | null;
  }) => {
    try {
      console.log('Starting authentication process:', isLogin ? 'login' : 'signup');
      
      if (!isLogin) {
        // Signup process
        console.log('Checking username availability...');
        if (!formData.username) {
          toast.error("Username is required");
          return;
        }

        // Check if username exists
        const { data: existingUser, error: usernameError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', formData.username)
          .maybeSingle();

        if (usernameError) {
          console.error('Username check error:', usernameError);
          toast.error("Error checking username availability");
          return;
        }

        if (existingUser) {
          console.log('Username is taken:', formData.username);
          toast.error("Username is already taken");
          return;
        }

        console.log('Creating new user account...');
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) {
          console.error('Signup error:', signUpError);
          if (signUpError.message.includes('Email')) {
            toast.error("Invalid email format");
          } else if (signUpError.message.includes('Password')) {
            toast.error("Password must be at least 6 characters");
          } else {
            toast.error(signUpError.message);
          }
          return;
        }

        if (!data.user) {
          console.error('No user data returned from signup');
          toast.error("Sign up failed");
          return;
        }

        console.log('User created successfully, handling profile picture...');
        let avatarUrl = null;

        if (formData.profilePicture) {
          const fileExt = formData.profilePicture.name.split('.').pop();
          const filePath = `${data.user.id}.${fileExt}`;

          console.log('Uploading profile picture...');
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, formData.profilePicture, {
              upsert: true
            });

          if (uploadError) {
            console.error('Profile picture upload error:', uploadError);
            toast.error("Failed to upload profile picture");
            return;
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
              username: formData.username,
              bio: formData.bio || '',
              avatar_url: avatarUrl,
              follower_count: 0
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error("Failed to create profile");
          return;
        }

        console.log('Profile created successfully');
        toast.success("Account created successfully!");
        navigate("/onboarding");
      } else {
        // Login process
        console.log('Attempting login...');
        console.log('Login credentials:', { email: formData.email, passwordLength: formData.password.length });
        
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          console.error("Sign in error:", signInError);
          console.error("Sign in error details:", {
            message: signInError.message,
            status: signInError.status,
            name: signInError.name
          });
          
          if (signInError.message === 'Invalid login credentials') {
            toast.error("Invalid email or password");
          } else {
            toast.error(signInError.message);
          }
          return;
        }

        if (!data.user) {
          console.error("No user data returned from login");
          toast.error("Login failed");
          return;
        }

        console.log("Sign in successful");
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <AuthHeader isLogin={isLogin} />
        <Card className="mx-4 border border-muted bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <AuthForm isLogin={isLogin} onSubmit={handleSubmit} />
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground hover:text-white hover:border hover:border-white hover:bg-transparent"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;