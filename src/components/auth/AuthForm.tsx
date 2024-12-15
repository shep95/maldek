import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AuthFormProps {
  isLogin: boolean;
  onSubmit: (formData: {
    email: string;
    password: string;
  }) => void;
}

export const AuthForm = ({ isLogin, onSubmit }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSubmit({
      email,
      password,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto px-4">
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-muted/50 w-full"
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-muted/50 w-full"
          required
          minLength={6}
        />
        <Button 
          type="submit" 
          className="w-full bg-accent hover:bg-accent/90 text-white"
        >
          {isLogin ? "Sign in" : "Sign up"}
        </Button>
      </div>
    </form>
  );
};