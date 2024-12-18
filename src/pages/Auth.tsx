import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (formData: {
    email: string;
    password: string;
    username?: string;
  }) => {
    try {
      if (isLogin) {
        console.log("Attempting to sign in user:", formData.email);
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;
        
        console.log("Sign in successful");
        toast.success("Successfully signed in!");
        navigate('/dashboard');
      } else {
        if (!formData.username) {
          throw new Error('Username is required');
        }

        console.log("Starting signup process:", { 
          email: formData.email, 
          username: formData.username 
        });

        // First check if username is available
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', formData.username.toLowerCase())
          .maybeSingle();

        if (checkError) {
          console.error("Username check error:", checkError);
          throw new Error('Error checking username availability');
        }

        if (existingUser) {
          console.error("Username is taken");
          throw new Error('Username is already taken');
        }

        console.log("Username is available, proceeding with signup");

        // Create the auth user with the username in metadata
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username.toLowerCase() // Store username in lowercase
            }
          }
        });

        if (signUpError) {
          console.error("Signup error:", signUpError);
          throw signUpError;
        }

        if (!signUpData.user?.id) {
          console.error("No user ID returned from signup");
          throw new Error('Failed to create user');
        }

        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify the profile was created
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', signUpData.user.id)
          .single();

        if (profileError || !profile) {
          console.error("Profile verification error:", profileError);
          toast.error("Account created but profile setup failed. Please try logging in.");
        } else {
          console.log("Profile created successfully:", profile);
          toast.success("Account created successfully! You can now sign in.");
        }

        setIsLogin(true); // Switch to login view
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 md:p-8 bg-background">
      <div className="w-full max-w-md bg-card/50 backdrop-blur-sm rounded-xl shadow-xl border border-accent/10 p-4 md:p-8 animate-fade-in">
        <AuthHeader isLogin={isLogin} />
        <AuthForm isLogin={isLogin} onSubmit={handleSubmit} />
        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;