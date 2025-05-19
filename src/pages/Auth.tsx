
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
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // User is already logged in, redirect to dashboard
        navigate('/dashboard');
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
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
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
        // Removed "Successfully signed in!" toast message here
        
        // Check if we need to initialize encryption
        // If there's no encrypted key in local storage, we'll show the security setup dialog
        const hasEncryptedKey = localStorage.getItem("bosley_encrypted_master_key");
        
        if (hasEncryptedKey) {
          // User already has an encryption key, redirect to dashboard
          navigate('/dashboard');
        } else {
          // User needs to set up encryption, show the security setup dialog
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

  const handleSecuritySetup = async (securityCode: string) => {
    try {
      console.log("Setting up encryption with security code");
      
      // Initialize the encryption service with the user's security code
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
      {/* Geometric Hero Background */}
      <HeroGeometric hideContent={true} />

      {/* Main content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-20"
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
        {/* Google Play badge below the main box */}
        <GooglePlayBadge />
      </motion.div>

      {/* Security Setup Dialog */}
      <SecuritySetupDialog 
        isOpen={showSecuritySetup} 
        onOpenChange={setShowSecuritySetup}
        onSetupComplete={handleSecuritySetup}
        userId={currentUserId}
      />

      {/* Decorative elements */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground/50 z-20">
        Bosley © 2024
      </div>
    </div>
  );
};

export default Auth;
