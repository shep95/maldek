import { motion } from "framer-motion";

interface AuthHeaderProps {
  isLogin: boolean;
}

export const AuthHeader = ({ isLogin }: AuthHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="text-center px-4 py-6 md:py-8"
    >
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-accent via-accent/80 to-accent bg-clip-text text-transparent animate-pulse">
        Bosley
      </h2>
      <p className="mt-2 text-sm text-muted-foreground/80">
        Next generation of social media with posts, networking, AI, and more
      </p>
      <motion.h3 
        key={isLogin ? 'login' : 'signup'}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="text-xl md:text-3xl mt-6 md:mt-8 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
      >
        {isLogin ? "Welcome back" : "Create account"}
      </motion.h3>
      <p className="text-muted-foreground mt-2 text-sm md:text-base">
        {isLogin ? "Enter your credentials to continue" : "Fill in your details to get started"}
      </p>
    </motion.div>
  );
};