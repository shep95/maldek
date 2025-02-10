
import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";

export const SecurityCodeSection = () => {
  const [securityCode, setSecurityCode] = useState("");
  const session = useSession();
  const queryClient = useQueryClient();

  const handleSetSecurityCode = async () => {
    if (securityCode.length !== 4 || !/^\d{4}$/.test(securityCode)) {
      toast.error("Please enter a valid 4-digit code");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ security_code: securityCode })
        .eq('id', session?.user?.id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['user-security-code'] });
      toast.success("Security code set successfully");
    } catch (error) {
      console.error('Error setting security code:', error);
      toast.error("Failed to set security code");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-destructive" />
        <h2 className="text-xl font-semibold">Security Code</h2>
      </div>
      
      <div className="space-y-4 rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Create your security code. You can only use 4 digits and they must be numbers.
          <br /><br />
          <span className="font-bold text-destructive">
            Warning: If you lose your code, you will lose access to your account.
          </span>
        </p>
        <Input
          type="password"
          placeholder="Enter 4-digit code"
          value={securityCode}
          onChange={(e) => setSecurityCode(e.target.value)}
          maxLength={4}
          pattern="\d{4}"
          required
          className="text-center text-2xl tracking-widest"
        />
        <Button 
          onClick={handleSetSecurityCode} 
          className="w-full"
          disabled={securityCode.length !== 4 || !/^\d{4}$/.test(securityCode)}
        >
          Set Security Code
        </Button>
      </div>
    </div>
  );
};
