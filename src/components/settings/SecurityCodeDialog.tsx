
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SecurityCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'verify';
  onSuccess: (securityCode: string) => void | Promise<void>;
}

export const SecurityCodeDialog = ({ isOpen, onOpenChange, action, onSuccess }: SecurityCodeDialogProps) => {
  const [securityCode, setSecurityCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (securityCode.length !== 4 || !/^\d{4}$/.test(securityCode)) {
      toast.error("Please enter a valid 4-digit code");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .rpc('verify_security_code', {
          user_uuid: (await supabase.auth.getUser()).data.user?.id,
          code: securityCode
        });

      if (error) throw error;
      
      if (!data) {
        toast.error("Invalid security code");
        return;
      }

      await onSuccess(securityCode);
      onOpenChange(false);
      setSecurityCode("");
    } catch (error) {
      console.error('Error handling security code:', error);
      toast.error("Failed to process security code");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Security Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter 4-digit code"
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value)}
            maxLength={4}
            pattern="\d{4}"
            required
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
