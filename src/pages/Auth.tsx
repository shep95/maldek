import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (formData: {
    email: string;
    password: string;
    username?: string;
    bio?: string;
    profilePicture?: File | null;
  }) => {
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) throw error;
        
        navigate("/dashboard");
      } else {
        console.log('Starting signup process...');
        const { error: signUpError, data } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        
        if (signUpError) throw signUpError;

        if (data.user) {
          console.log('User created successfully, uploading profile picture...');
          let avatarUrl = null;

          if (formData.profilePicture) {
            const fileExt = formData.profilePicture.name.split('.').pop();
            const filePath = `${data.user.id}.${fileExt}`;

            console.log('Uploading profile picture to storage...');
            const { error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(filePath, formData.profilePicture, {
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
                username: formData.username,
                bio: formData.bio,
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