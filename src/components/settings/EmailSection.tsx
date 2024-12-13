import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const EmailSection = () => {
  const [newEmail, setNewEmail] = useState("");

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
    </Card>
  );
};