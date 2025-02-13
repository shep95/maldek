
import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";

export const SecurityCodeSection = () => {
  const [newSecurityCode, setNewSecurityCode] = useState("");
  const [oldSecurityCode, setOldSecurityCode] = useState("");
  const [isChangingCode, setIsChangingCode] = useState(false);
  const session = useSession();
  const queryClient = useQueryClient();

  const handleSetSecurityCode = async () => {
    if (newSecurityCode.length !== 4 || !/^\d{4}$/.test(newSecurityCode)) {
      toast.error("Please enter a valid 4-digit code");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ security_code: newSecurityCode })
        .eq('id', session?.user?.id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['user-security-code'] });
      toast.success("Security code set successfully");
      setNewSecurityCode("");
      setIsChangingCode(false);
    } catch (error) {
      console.error('Error setting security code:', error);
      toast.error("Failed to set security code");
    }
  };

  const handleChangeSecurityCode = async () => {
    if (newSecurityCode.length !== 4 || !/^\d{4}$/.test(newSecurityCode)) {
      toast.error("Please enter a valid 4-digit code");
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('update_security_code', {
          old_code: oldSecurityCode,
          new_code: newSecurityCode
        });

      if (error) throw error;

      if (!data) {
        toast.error("Invalid old security code");
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ['user-security-code'] });
      toast.success("Security code updated successfully");
      setNewSecurityCode("");
      setOldSecurityCode("");
      setIsChangingCode(false);
    } catch (error) {
      console.error('Error changing security code:', error);
      toast.error("Failed to change security code");
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
          {isChangingCode ? (
            "Enter your old security code and set a new one. You can only use 4 digits."
          ) : (
            "Create or change your security code. You can only use 4 digits and they must be numbers."
          )}
          <br /><br />
          <span className="font-bold text-destructive">
            Warning: If you lose your code, you will lose access to your account.
          </span>
        </p>

        {isChangingCode && (
          <Input
            type="password"
            placeholder="Enter old 4-digit code"
            value={oldSecurityCode}
            onChange={(e) => setOldSecurityCode(e.target.value)}
            maxLength={4}
            pattern="\d{4}"
            required
            className="text-center text-2xl tracking-widest"
          />
        )}

        <Input
          type="password"
          placeholder="Enter new 4-digit code"
          value={newSecurityCode}
          onChange={(e) => setNewSecurityCode(e.target.value)}
          maxLength={4}
          pattern="\d{4}"
          required
          className="text-center text-2xl tracking-widest"
        />

        <div className="space-y-2">
          <Button 
            onClick={isChangingCode ? handleChangeSecurityCode : handleSetSecurityCode} 
            className="w-full"
            disabled={
              newSecurityCode.length !== 4 || 
              !/^\d{4}$/.test(newSecurityCode) ||
              (isChangingCode && (oldSecurityCode.length !== 4 || !/^\d{4}$/.test(oldSecurityCode)))
            }
          >
            {isChangingCode ? "Change Security Code" : "Set Security Code"}
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              setIsChangingCode(!isChangingCode);
              setNewSecurityCode("");
              setOldSecurityCode("");
            }}
            className="w-full"
          >
            {isChangingCode ? "Cancel" : "Change Existing Code"}
          </Button>
        </div>
      </div>
    </div>
  );
};
