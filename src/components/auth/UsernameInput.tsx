import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const UsernameInput = ({ value, onChange, onValidationChange }: UsernameInputProps) => {
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkUsername = async () => {
      if (!value || value.length < 3) {
        setIsUsernameTaken(false);
        setIsCheckingUsername(false);
        onValidationChange(false);
        return;
      }

      setIsCheckingUsername(true);
      try {
        console.log("Checking username availability:", value);
        const { data, error } = await supabase
          .rpc('check_username_availability', {
            username_to_check: value
          });

        if (error) {
          console.error('Username check error:', error);
          throw error;
        }

        const isAvailable = Boolean(data);
        console.log('Username availability result:', { username: value, isAvailable });
        
        setIsUsernameTaken(!isAvailable);
        onValidationChange(isAvailable);
        
        if (!isAvailable) {
          toast.error("This username is already taken");
        }
      } catch (error) {
        console.error('Username check error:', error);
        setIsUsernameTaken(false);
        onValidationChange(false);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout for debouncing
    timeoutId = setTimeout(checkUsername, 500);

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [value, onValidationChange]);

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Username (minimum 3 characters)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-muted/50 w-full ${
          isUsernameTaken ? "border-red-500" : 
          value.length >= 3 && !isUsernameTaken ? "border-green-500" : ""
        }`}
        required
        minLength={3}
      />
      {value.length >= 3 && (
        <div className="absolute right-3 top-3 text-xs md:text-sm">
          {isCheckingUsername ? (
            <span className="text-muted-foreground">Checking...</span>
          ) : isUsernameTaken ? (
            <span className="text-red-500">Username taken</span>
          ) : (
            <span className="text-green-500">Username available</span>
          )}
        </div>
      )}
    </div>
  );
};