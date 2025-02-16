
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData: {
    email: string;
    password: string;
    username?: string;
  }) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (isLogin) {
        console.log("Attempting to sign in user:", formData.email);
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          if (signInError.message.includes('Failed to fetch')) {
            throw new Error('Network error. Please check your connection and try again.');
          }
          throw signInError;
        }
        
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
              username: formData.username.toLowerCase()
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('Failed to fetch')) {
            throw new Error('Network error. Please check your connection and try again.');
          }
          console.error("Signup error:", signUpError);
          throw signUpError;
        }

        if (!signUpData.user?.id) {
          console.error("No user ID returned from signup");
          throw new Error('Failed to create user');
        }

        // Create initial user settings
        const { error: settingsError } = await supabase
          .from('user_settings')
          .insert({
            user_id: signUpData.user.id,
            preferred_language: 'en',
            theme: 'system'
          });

        if (settingsError) {
          console.error("Error creating user settings:", settingsError);
          // Don't throw here as the user is already created
          toast.error("Account created but settings setup failed. You can update them later.");
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 md:p-8 bg-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] -top-48 -right-48 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-[500px] h-[500px] -bottom-48 -left-48 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(#ff5e00 1px, transparent 1px), linear-gradient(to right, #ff5e00 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Main content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-accent/10 p-4 md:p-8">
          <AuthHeader isLogin={isLogin} />
          <AuthForm isLogin={isLogin} onSubmit={handleSubmit} />
          
          {/* Toggle button with futuristic style */}
          <div className="text-center mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-accent transition-colors relative group"
              disabled={isSubmitting}
            >
              <span className="relative z-10">
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </span>
              <span className="absolute inset-0 bg-accent/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full -z-10" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground/50">
        Bosley © 2024
      </div>
    </div>
  );
};

export default Auth;
