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
      console.log('Starting authentication process...');
      
      if (isLogin) {
        console.log('Attempting to sign in user:', formData.email);
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;
        console.log('Sign in successful');
        navigate("/dashboard");
      } else {
        console.log('Attempting to sign up user:', formData.email);
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) throw signUpError;

        // Create profile with username after successful signup
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: (await supabase.auth.getUser()).data.user?.id,
              username: formData.username,
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error("Account created but profile setup failed. You can set it up later.");
        }

        console.log('Sign up successful');
        toast.success("Account created successfully!");
        navigate("/dashboard");
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