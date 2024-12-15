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
    bio?: string;
    profilePicture?: File | null;
  }) => {
    try {
      console.log('Starting authentication process...');
      
      if (isLogin) {
        console.log('Attempting to sign in user:', formData.email);
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          console.error('Sign in error:', signInError);
          throw signInError;
        }

        console.log('Sign in successful');
        navigate("/dashboard");
      } else {
        console.log('Attempting to sign up user:', formData.email);
        const { error: signUpError, data } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          throw signUpError;
        }

        if (data.user) {
          let avatarUrl = null;

          if (formData.profilePicture) {
            console.log('Uploading profile picture');
            const fileExt = formData.profilePicture.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(fileName, formData.profilePicture);

            if (uploadError) {
              console.error('Profile picture upload error:', uploadError);
              throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);

            avatarUrl = publicUrl;
          }

          console.log('Creating user profile');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: formData.username,
              avatar_url: avatarUrl,
              bio: formData.bio || '',
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            throw profileError;
          }
        }

        toast.success("Account created successfully! Please check your email to verify your account.");
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Handle specific error messages
      if (error.message?.includes('Invalid login credentials')) {
        toast.error("Invalid email or password");
      } else if (error.message?.includes('Email rate limit exceeded')) {
        toast.error("Too many attempts. Please try again later");
      } else {
        toast.error(error.message || "An error occurred during authentication");
      }
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