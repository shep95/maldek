
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { GooglePlayBadge } from "@/components/auth/GooglePlayBadge";
import { SecuritySetupDialog } from "@/components/auth/SecuritySetupDialog";
import { encryptionService } from "@/services/encryptionService";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecuritySetup, setShowSecuritySetup] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Don't show error to user, just continue with auth flow
      }
    };

    checkSession();
  }, [navigate]);

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
        
        // Add timeout for sign in
        const signInPromise = supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Sign in timeout')), 15000);
        });
        
        const { data, error: signInError } = await Promise.race([
          signInPromise,
          timeoutPromise
        ]) as any;

        if (signInError) {
          if (signInError.message.includes('Failed to fetch') || 
              signInError.message.includes('timeout')) {
            throw new Error('Network error. Please check your connection and try again.');
          }
          throw signInError;
        }
        
        console.log("Sign in successful");
        
        // Check if we need to initialize encryption
        const hasEncryptedKey = localStorage.getItem("bosley_encrypted_master_key");
        
        if (hasEncryptedKey) {
          navigate('/dashboard');
        } else {
          setCurrentUserId(data.user?.id || null);
          setShowSecuritySetup(true);
        }
      } else {
        if (!formData.username) {
          throw new Error('Username is required');
        }

        console.log("Starting signup process:", { 
          email: formData.email, 
          username: formData.username 
        });

        // First check if username is available with timeout
        const checkPromise = supabase
          .from('profiles')
          .select('username')
          .eq('username', formData.username.toLowerCase())
          .maybeSingle();
          
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Username check timeout')), 10000);
        });

        const { data: existingUser, error: checkError } = await Promise.race([
          checkPromise,
          timeoutPromise
        ]) as any;

        if (checkError && !checkError.message?.includes('timeout')) {
          console.error("Username check error:", checkError);
          throw new Error('Error checking username availability');
        }

        if (existingUser) {
          console.error("Username is taken");
          throw new Error('Username is already taken');
        }

        console.log("Username is available, proceeding with signup");

        // Create the auth user with timeout
        const signUpPromise = supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username.toLowerCase()
            }
          }
        });

        const { data: signUpData, error: signUpError } = await Promise.race([
          signUpPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Signup timeout')), 15000))
        ]) as any;

        if (signUpError) {
          if (signUpError.message.includes('Failed to fetch') || 
              signUpError.message.includes('timeout')) {
            throw new Error('Network error. Please check your connection and try again.');
          }
          console.error("Signup error:", signUpError);
          throw signUpError;
        }

        if (!signUpData.user?.id) {
          console.error("No user ID returned from signup");
          throw new Error('Failed to create user');
        }

        // Wait for profile creation with shorter timeout
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify the profile was created
        try {
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
        } catch (verifyError) {
          console.error("Profile verification failed:", verifyError);
          toast.success("Account created! Please try signing in.");
        }

        setIsLogin(true);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      const errorMessage = error.message?.includes('timeout') 
        ? 'Request timed out. Please try again.'
        : error.message || "Authentication failed";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSecuritySetup = async (securityCode: string) => {
    try {
      console.log("Setting up encryption with security code");
      
      const success = await encryptionService.initialize(securityCode);
      
      if (success) {
        toast.success("Security setup completed. Your data will now be encrypted.");
        navigate('/dashboard');
      } else {
        toast.error("Failed to set up security. Please try again.");
      }
    } catch (error) {
      console.error("Security setup error:", error);
      toast.error("Failed to set up security");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 md:p-8 relative overflow-hidden">
      <HeroGeometric hideContent={true} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-20"
      >
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-accent/10 p-4 md:p-8">
          <AuthHeader isLogin={isLogin} />
          <AuthForm 
            isLogin={isLogin} 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
          
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
        <GooglePlayBadge />
      </motion.div>

      <SecuritySetupDialog 
        isOpen={showSecuritySetup} 
        onOpenChange={setShowSecuritySetup}
        onSetupComplete={handleSecuritySetup}
        userId={currentUserId}
      />

      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground/50 z-20">
        Bosley © 2024
      </div>
    </div>
  );
};

export default Auth;
