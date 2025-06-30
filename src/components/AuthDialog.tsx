
import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthDialogProps {
  trigger: string;
  title: string;
  isSignUp?: boolean;
}

export const AuthDialog = ({ trigger, title, isSignUp = false }: AuthDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: username
            }
          }
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created successfully! Please check your email to verify your account.");
          setOpen(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Signed in successfully!");
          setOpen(false);
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={isSignUp ? "default" : "outline"} 
          className={isSignUp 
            ? "bg-white text-black hover:bg-white/90" 
            : "border-white/30 text-white hover:bg-white/10"
          }
          size="sm"
        >
          {trigger}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black/90 backdrop-blur-xl border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-light text-white">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/80">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Enter your username"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Enter your password"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-white text-black hover:bg-white/90"
            disabled={loading}
          >
            {loading ? "Please wait..." : title}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
