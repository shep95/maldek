
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SecurityCodeDialog } from "./SecurityCodeDialog";

export const AccountSection = () => {
  const [newUsername, setNewUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasSetCode, setHasSetCode] = useState(false);
  const [isSettingCode, setIsSettingCode] = useState(false);

  const handleUsernameCheck = async (username: string) => {
    if (!username || username.length < 3) {
      setIsUsernameTaken(false);
      return;
    }

    setIsCheckingUsername(true);
    try {
      console.log("Checking username availability:", username);
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        console.error('Username check error:', error);
        return;
      }

      const isTaken = !!data;
      console.log('Username check result:', { username, isTaken });
      setIsUsernameTaken(isTaken);
    } catch (error) {
      console.error('Username check error:', error);
    } finally {
      setIsCheckingUsername(false);
    }
  };

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

  const handleUpdateUsername = async () => {
    if (!newUsername || newUsername.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    if (isUsernameTaken) {
      toast.error("Username is already taken");
      return;
    }

    checkSecurityCodeStatus();
  };

  const handleVerificationSuccess = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername.toLowerCase() })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast.success("Username updated successfully");
      setNewUsername("");
    } catch (error) {
      console.error('Error updating username:', error);
      toast.error("Failed to update username");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Username</CardTitle>
        <CardDescription>Change your username</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="New username (minimum 3 characters)"
            value={newUsername}
            onChange={(e) => {
              setNewUsername(e.target.value);
              handleUsernameCheck(e.target.value);
            }}
            className={`${
              isUsernameTaken ? "border-red-500" : 
              newUsername.length >= 3 && !isUsernameTaken ? "border-green-500" : ""
            }`}
          />
          {newUsername.length >= 3 && (
            <div className="absolute right-3 top-3 text-sm">
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
        <Button onClick={handleUpdateUsername} disabled={isUsernameTaken || !newUsername}>
          Update Username
        </Button>
      </CardContent>

      <SecurityCodeDialog
        isOpen={isSettingCode}
        onOpenChange={setIsSettingCode}
        action="set"
        onSuccess={handleUpdateUsername}
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
