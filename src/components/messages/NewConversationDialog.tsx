
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { secureLog } from "@/utils/secureLogging";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectConversation: (id: string) => void;
}

export const NewConversationDialog = ({
  open,
  onOpenChange,
  onSelectConversation,
}: NewConversationDialogProps) => {
  const [username, setUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const session = useSession();

  const handleCreateConversation = async () => {
    if (!username.trim()) {
      setUsernameError("Please enter a username");
      return;
    }
    
    if (!session?.user?.id) {
      toast.error("You must be logged in");
      return;
    }
    
    try {
      setIsCreating(true);
      setUsernameError("");
      
      // Find the recipient user by username
      const { data: recipient, error: userError } = await supabase
        .from("profiles")
        .select("id, username")
        .ilike("username", username)
        .single();
      
      if (userError || !recipient) {
        setUsernameError("User not found");
        return;
      }
      
      if (recipient.id === session.user.id) {
        setUsernameError("You can't message yourself");
        return;
      }
      
      // Create conversation ID based on the two user IDs
      const conversationId = `${session.user.id}-${recipient.id}`;
      
      // Send an initial message to establish the conversation
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          sender_id: session.user.id,
          recipient_id: recipient.id,
          content: "Started a conversation",
          status: 'sent'
        });
      
      if (messageError) throw messageError;
      
      // Select the new conversation
      onSelectConversation(conversationId);
      onOpenChange(false);
      
    } catch (error) {
      secureLog(error, { level: "error" });
      toast.error("Failed to create conversation");
    } finally {
      setIsCreating(false);
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setUsername("");
      setUsernameError("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black border-white/10">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Start a new conversation with another user.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (usernameError) setUsernameError("");
              }}
              className={`bg-black/40 border-white/10 ${
                usernameError ? "border-red-500" : ""
              }`}
            />
            {usernameError && (
              <p className="text-sm text-red-500">{usernameError}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateConversation} disabled={isCreating}>
            Start Conversation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
