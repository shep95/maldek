
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SecurityCodeDialog } from "./SecurityCodeDialog";

export const PasswordSection = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    checkSecurityCodeStatus();
  };

  const handleVerificationSuccess = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error("Failed to update password");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button 
          onClick={handleUpdatePassword}
          disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
        >
          Update Password
        </Button>
      </CardContent>

      <SecurityCodeDialog
        isOpen={isSettingCode}
        onOpenChange={setIsSettingCode}
        action="set"
        onSuccess={handleUpdatePassword}
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
