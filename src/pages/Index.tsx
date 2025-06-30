
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from '@supabase/auth-helpers-react';
import Header from "../components/Header";
import WatermarkPopup from "../components/WatermarkPopup";
import { BackgroundPaths } from "../components/ui/background-paths";
import { AuthForm } from "@/components/auth/AuthForm";
import { motion } from "framer-motion";

const Index = () => {
  const session = useSession();
  const navigate = useNavigate();
  const [showWatermarkPopup, setShowWatermarkPopup] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const handleSubmit = async (formData: {
    email: string;
    password: string;
    username?: string;
  }) => {
    setIsSubmitting(true);
    // The AuthForm component will handle the actual authentication
    // We just need to manage the loading state
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full relative" style={{
      backgroundColor: '#0a0a0a'
    }}>
      <BackgroundPaths />
      <div className="relative z-10">
        <Header />
        
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-4rem)] px-4 gap-8 lg:gap-16">
          {/* Left side - Hero content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tight leading-none">
              AI For Humanity
            </h1>
            <p className="text-white/70 text-lg md:text-xl mt-4 font-normal">
              Powered by Zorak Corp
            </p>
            <p className="text-white/50 text-sm md:text-base mt-6 max-w-md mx-auto lg:mx-0">
              Join the future of social media with AI-powered content creation, 
              real-time collaboration, and meaningful connections.
            </p>
          </motion.div>

          {/* Right side - Auth forms */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 max-w-md w-full"
          >
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 md:p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {isLogin ? "Welcome Back" : "Join Us"}
                </h2>
                <p className="text-white/60 text-sm">
                  {isLogin ? "Sign in to your account" : "Create your account"}
                </p>
              </div>

              <AuthForm 
                isLogin={isLogin} 
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
              
              <div className="text-center mt-6">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-white/60 hover:text-white transition-colors relative group"
                  disabled={isSubmitting}
                >
                  <span className="relative z-10">
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </span>
                  <span className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full -z-10" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Watermark Logo */}
        <div className="fixed bottom-4 right-4 z-20">
          <img 
            src="/lovable-uploads/56518f9a-8c42-4617-b2ab-23c193f39841.png" 
            alt="RO Logo" 
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 opacity-30 hover:opacity-50 transition-opacity duration-300 cursor-pointer" 
            onClick={() => setShowWatermarkPopup(true)} 
          />
        </div>
      </div>

      <WatermarkPopup open={showWatermarkPopup} onOpenChange={setShowWatermarkPopup} />
    </div>
  );
};

export default Index;
