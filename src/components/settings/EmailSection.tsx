
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SecurityCodeDialog } from "./SecurityCodeDialog";

export const EmailSection = () => {
  const [newEmail, setNewEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasSetCode, setHasSetCode] = useState(false);
  const [isSettingCode, setIsSettingCode] = useState(false);

  const checkSecurityCodeStatus = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('has_set_security_code')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    setHasSetCode(!!data?.has_set_security_code);
    if (!data?.has_set_security_code) {
      setIsSettingCode(true);
    } else {
      setIsVerifying(true);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      toast.error("Please enter a new email");
      return;
    }

    checkSecurityCodeStatus();
  };

  const handleVerificationSuccess = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      toast.success("Email update initiated. Please check your new email for verification.");
      setNewEmail("");
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error("Failed to update email");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Email</CardTitle>
        <CardDescription>Change your email address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="email"
          placeholder="New email address"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <Button onClick={handleUpdateEmail} disabled={!newEmail}>
          Update Email
        </Button>
      </CardContent>

      <SecurityCodeDialog
        isOpen={isSettingCode}
        onOpenChange={setIsSettingCode}
        action="set"
        onSuccess={handleUpdateEmail}
      />

      <SecurityCodeDialog
        isOpen={isVerifying}
        onOpenChange={setIsVerifying}
        action="verify"
        onSuccess={handleVerificationSuccess}
      />
    </Card>
  );
};
