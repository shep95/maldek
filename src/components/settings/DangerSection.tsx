
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SecurityCodeDialog } from "./SecurityCodeDialog";

export const DangerSection = () => {
  const navigate = useNavigate();
  const [isVerifyingForData, setIsVerifyingForData] = useState(false);
  const [isVerifyingForAccount, setIsVerifyingForAccount] = useState(false);

  const handleDeleteData = async () => {
    setIsVerifyingForData(true);
  };

  const handleDeleteAccount = async () => {
    setIsVerifyingForAccount(true);
  };

  const handleDataDeletion = async () => {
    try {
      const { error } = await supabase.rpc('delete_user_data');
      if (error) throw error;
      toast.success("All data deleted successfully");
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error("Failed to delete data");
    }
  };

  const handleAccountDeletion = async () => {
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;

      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("Failed to delete account");
    }
  };

  const handleVerifyForData = async (securityCode: string) => {
    try {
      const { error } = await supabase.rpc('delete_user_data_with_code', {
        code: securityCode
      });
      
      if (error) throw error;
      
      toast.success("All data deleted successfully");
      setIsVerifyingForData(false);
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error("Failed to delete data. Please check your security code.");
    }
  };

  const handleVerifyForAccount = async (securityCode: string) => {
    try {
      const { error } = await supabase.rpc('delete_user_account_with_code', {
        code: securityCode
      });
      
      if (error) throw error;

      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("Failed to delete account. Please check your security code.");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Delete Data</CardTitle>
          <CardDescription>Delete all your posts, comments, and reset your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete All Data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your posts,
                  comments, and reset your profile information.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteData} className="bg-destructive text-destructive-foreground">
                  Delete All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
          <CardDescription>Permanently delete your account and all associated data</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <SecurityCodeDialog
        isOpen={isVerifyingForData}
        onOpenChange={setIsVerifyingForData}
        action="verify"
        onSuccess={handleVerifyForData}
      />

      <SecurityCodeDialog
        isOpen={isVerifyingForAccount}
        onOpenChange={setIsVerifyingForAccount}
        action="verify"
        onSuccess={handleVerifyForAccount}
      />
    </>
  );
};
