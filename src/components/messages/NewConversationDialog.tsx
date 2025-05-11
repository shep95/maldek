
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
import { useEncryption } from "@/providers/EncryptionProvider";
import { secureLog } from "@/utils/secureLogging";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const [conversationName, setConversationName] = useState("");
  const [participantUsername, setParticipantUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [isGroupChat, setIsGroupChat] = useState(false);
  const session = useSession();
  const encryption = useEncryption();

  const validateForm = () => {
    if (!conversationName.trim()) {
      toast.error("Please enter a conversation name");
      return false;
    }

    if (!isGroupChat && !participantUsername.trim()) {
      setUsernameError("Please enter a username");
      return false;
    }

    return true;
  };

  const handleCreateConversation = async () => {
    try {
      if (!validateForm() || !session?.user?.id) return;

      setIsCreating(true);
      secureLog("Creating new conversation", { level: "info" });

      // Check if user exists (for direct messages)
      let participantId = null;
      
      if (!isGroupChat) {
        const { data: participant, error: participantError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", participantUsername.toLowerCase())
          .single();

        if (participantError || !participant) {
          setUsernameError("User not found");
          setIsCreating(false);
          return;
        }

        participantId = participant.id;

        // Check if conversation already exists
        const { data: existingConvo, error: convoError } = await supabase
          .from("conversations")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("participant_id", participantId)
          .single();

        if (!convoError && existingConvo) {
          onSelectConversation(existingConvo.id);
          onOpenChange(false);
          return;
        }
      }

      // Create encrypted metadata
      let encryptedMetadata = null;
      if (encryption.isEncryptionInitialized) {
        const metadata = {
          isGroup: isGroupChat,
          createdAt: new Date().toISOString()
        };
        
        encryptedMetadata = await encryption.encryptText(JSON.stringify(metadata));
      }

      // Create conversation
      const { data: conversation, error: createError } = await supabase
        .from("conversations")
        .insert({
          name: conversationName,
          user_id: session.user.id,
          participant_id: participantId,
          encrypted_metadata: encryptedMetadata,
          is_group: isGroupChat
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // If it's a group, we might add functionality to add multiple participants here

      onSelectConversation(conversation.id);
      toast.success("Conversation created");
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
      setConversationName("");
      setParticipantUsername("");
      setUsernameError("");
      setIsGroupChat(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black border-white/10">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Create a new conversation with another user or a group.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Conversation Name</Label>
            <Input
              id="name"
              placeholder="Enter conversation name"
              value={conversationName}
              onChange={(e) => setConversationName(e.target.value)}
              className="bg-black/40 border-white/10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isGroup" 
              checked={isGroupChat} 
              onCheckedChange={(checked) => setIsGroupChat(checked === true)}
            />
            <Label htmlFor="isGroup">This is a group chat</Label>
          </div>

          {!isGroupChat && (
            <div className="grid gap-2">
              <Label htmlFor="username">Participant Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={participantUsername}
                onChange={(e) => {
                  setParticipantUsername(e.target.value);
                  if (usernameError) setUsernameError("");
                }}
                className={cn(
                  "bg-black/40 border-white/10",
                  usernameError && "border-red-500"
                )}
              />
              {usernameError && (
                <p className="text-sm text-red-500">{usernameError}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateConversation} disabled={isCreating}>
            Create Conversation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
