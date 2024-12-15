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
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;
        
        toast.success("Successfully signed in!");
        navigate('/dashboard');
      } else {
        if (!formData.username) {
          throw new Error('Username is required');
        }

        // Check username availability one last time
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', formData.username)
          .maybeSingle();

        if (existingUser) {
          throw new Error('Username is already taken');
        }

        const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) throw signUpError;

        if (!signUpData.user?.id) {
          throw new Error('Failed to create user');
        }

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: signUpData.user.id,
            username: formData.username,
          }]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error("Account created but profile setup failed. Please try again.");
          return;
        }

        toast.success("Account created successfully!");
        navigate('/dashboard');
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