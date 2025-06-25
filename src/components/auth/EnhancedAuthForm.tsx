
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Shield, Eye, EyeOff } from "lucide-react";
import { validateEmail, sanitizeInput, validateFileUpload } from "@/utils/securityUtils";

// Enhanced security patterns
const SECURITY_PATTERNS = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/
};

const DISPOSABLE_EMAIL_DOMAINS = [
  "10minutemail.com", "guerrillamail.com", "mailinator.com", "temp-mail.org",
  "fakeinbox.com", "tempmail.com", "yopmail.com", "getairmail.com",
  "mailnesia.com", "mailcatch.com", "trashmail.com", "sharklasers.com"
];

interface EnhancedAuthFormProps {
  isLogin: boolean;
  onSubmit: (formData: {
    email: string;
    password: string;
    username?: string;
  }) => void;
  isSubmitting?: boolean;
}

export const EnhancedAuthForm = ({ isLogin, onSubmit, isSubmitting = false }: EnhancedAuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);
  const [isDisposableEmail, setIsDisposableEmail] = useState(false);
  const [isValidEmailDomain, setIsValidEmailDomain] = useState(true);
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  const captchaRef = useRef<HCaptcha>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const effectiveIsSubmitting = isSubmitting || localIsSubmitting;

  // Enhanced password strength calculation
  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (pwd.length >= 12) strength += 1;
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/\d/.test(pwd)) strength += 1;
    if (/[@$!%*?&]/.test(pwd)) strength += 1;
    if (pwd.length >= 16) strength += 1;
    return Math.min(strength, 5);
  };

  // Enhanced email validation with security checks
  const validateEmailSecurity = (email: string) => {
    const warnings: string[] = [];
    
    if (!validateEmail(email)) {
      warnings.push("Invalid email format");
      setIsValidEmailDomain(false);
    } else {
      setIsValidEmailDomain(true);
    }
    
    if (email.includes('@')) {
      const domain = email.split('@')[1].toLowerCase();
      if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
        warnings.push("Temporary email addresses are not allowed");
        setIsDisposableEmail(true);
      } else {
        setIsDisposableEmail(false);
      }
    }
    
    setSecurityWarnings(warnings);
  };

  // Enhanced username validation
  const validateUsername = (username: string): boolean => {
    if (!SECURITY_PATTERNS.username.test(username)) {
      return false;
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = ['admin', 'root', 'system', 'test', 'guest'];
    return !suspiciousPatterns.some(pattern => 
      username.toLowerCase().includes(pattern)
    );
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedEmail = sanitizeInput(e.target.value);
    setEmail(sanitizedEmail);
    validateEmailSecurity(sanitizedEmail);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedPassword = sanitizeInput(e.target.value);
    setPassword(sanitizedPassword);
    setPasswordStrength(calculatePasswordStrength(sanitizedPassword));
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedUsername = sanitizeInput(e.target.value);
    setUsername(sanitizedUsername);
  };

  const handleUsernameCheck = async (username: string) => {
    if (!username || username.length < 3 || !validateUsername(username)) {
      setIsUsernameTaken(false);
      setIsCheckingUsername(false);
      return;
    }

    setIsCheckingUsername(true);
    setIsUsernameTaken(false);

    try {
      const { data, error } = await supabase.rpc(
        'check_username_availability',
        { username_to_check: username.toLowerCase() }
      );

      if (error) {
        console.error("Username check error:", error);
        toast.error("Error checking username availability");
        return;
      }

      setIsUsernameTaken(!data);
    } catch (error) {
      console.error("Username check failed:", error);
      toast.error("Failed to check username availability");
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleCaptchaVerify = (token: string) => {
    setHcaptchaToken(token);
  };

  const resetCaptcha = () => {
    setHcaptchaToken(null);
    if (captchaRef.current) {
      captchaRef.current.resetCaptcha();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!email || !password || (!isLogin && !username)) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isLogin) {
      if (!validateUsername(username)) {
        toast.error("Username contains invalid characters or reserved words");
        return;
      }
      
      if (isUsernameTaken) {
        toast.error("Username is already taken");
        return;
      }
      
      if (passwordStrength < 3) {
        toast.error("Password is too weak. Use at least 12 characters with uppercase, lowercase, numbers, and special characters.");
        return;
      }
    }

    if (isDisposableEmail) {
      toast.error("Please use a permanent email address");
      return;
    }

    if (!isValidEmailDomain) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!hcaptchaToken) {
      toast.error("Please complete the security verification");
      return;
    }

    setLocalIsSubmitting(true);

    try {
      if (!isLogin) {
        // Enhanced signup with additional security
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.toLowerCase(),
              captchaToken: hcaptchaToken,
              securityLevel: 'enhanced'
            }
          }
        });

        if (error) throw error;

        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Account created successfully! Please check your email for verification.");
        resetCaptcha();
      } else {
        await onSubmit({ email, password });
        resetCaptcha();
      }
    } catch (error: any) {
      console.error("Enhanced auth error:", error);
      toast.error(error.message || "Authentication failed");
      resetCaptcha();
    } finally {
      setLocalIsSubmitting(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isLogin && username.length >= 3) {
        handleUsernameCheck(username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, isLogin]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 2) return "bg-red-500";
    if (passwordStrength < 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 2) return "Weak";
    if (passwordStrength < 4) return "Medium";
    return "Strong";
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-sm mx-auto px-4">
      <div className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <Input
              type="text"
              placeholder="Username (3-20 characters, letters, numbers, _, -)"
              value={username}
              onChange={handleUsernameChange}
              className={`${
                isUsernameTaken ? "border-red-500" : 
                username.length >= 3 && !isUsernameTaken && !isCheckingUsername && validateUsername(username) ? "border-green-500" : ""
              }`}
              required
              minLength={3}
              maxLength={20}
              disabled={effectiveIsSubmitting}
              autoComplete="username"
            />
            {username.length >= 3 && (
              <div className="absolute right-3 top-3 text-sm">
                {isCheckingUsername ? (
                  <span className="text-muted-foreground">Checking...</span>
                ) : isUsernameTaken ? (
                  <span className="text-red-500">Username taken</span>
                ) : validateUsername(username) ? (
                  <span className="text-green-500">Username available</span>
                ) : (
                  <span className="text-red-500">Invalid username</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            className={`bg-muted/50 w-full ${
              isDisposableEmail || !isValidEmailDomain ? "border-red-500" : 
              email && isValidEmailDomain ? "border-green-500" : ""
            }`}
            required
            disabled={effectiveIsSubmitting}
            autoComplete="email"
          />
          {securityWarnings.length > 0 && (
            <div className="text-xs text-red-500 mt-1">
              {securityWarnings.map((warning, index) => (
                <div key={index}>{warning}</div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            className="bg-muted/50 w-full pr-10"
            required
            minLength={isLogin ? 6 : 12}
            disabled={effectiveIsSubmitting}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            disabled={effectiveIsSubmitting}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          
          {!isLogin && password && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {getPasswordStrengthText()}
                </span>
              </div>
              {passwordStrength < 3 && (
                <div className="text-xs text-yellow-600 mt-1">
                  Use 12+ characters with uppercase, lowercase, numbers, and special characters
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-center">
          <HCaptcha
            sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001"}
            onVerify={handleCaptchaVerify}
            ref={captchaRef}
            theme="dark"
            size="normal"
          />
        </div>
        
        <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1 mt-1">
          <Shield className="w-3 h-3" />
          <span>Military-grade security protection</span>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-accent hover:bg-accent/90 text-white"
          disabled={
            effectiveIsSubmitting || 
            !hcaptchaToken || 
            (!isLogin && (
              isCheckingUsername || 
              isUsernameTaken || 
              isDisposableEmail || 
              !isValidEmailDomain ||
              passwordStrength < 3 ||
              !validateUsername(username)
            ))
          }
        >
          {effectiveIsSubmitting ? "Securing..." : (isLogin ? "Sign in" : "Create secure account")}
        </Button>
      </div>
    </form>
  );
};
