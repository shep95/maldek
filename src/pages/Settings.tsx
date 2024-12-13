import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "sonner";

const Settings = () => {
  const session = useSession();
  const navigate = useNavigate();
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);

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

  const handleUpdateUsername = async () => {
    if (!newUsername || newUsername.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    if (isUsernameTaken) {
      toast.error("Username is already taken");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', session?.user?.id);

      if (error) throw error;

      toast.success("Username updated successfully");
      setNewUsername("");
    } catch (error) {
      console.error('Error updating username:', error);
      toast.error("Failed to update username");
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      toast.error("Please enter a new email");
      return;
    }

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

  const handleDeleteData = async () => {
    try {
      // Delete user's posts
      const { error: postsError } = await supabase
        .from('posts')
        .delete()
        .eq('user_id', session?.user?.id);
      if (postsError) throw postsError;

      // Delete user's comments
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('user_id', session?.user?.id);
      if (commentsError) throw commentsError;

      // Reset profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          banner_url: null,
          bio: null
        })
        .eq('id', session?.user?.id);
      if (profileError) throw profileError;

      toast.success("All data deleted successfully");
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error("Failed to delete data");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(
        session?.user?.id as string
      );
      if (error) throw error;

      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Settings</h1>

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
      </Card>

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
      </Card>

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
      </Card>

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
    </div>
  );
};

export default Settings;