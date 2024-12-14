import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface MessageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientName: string;
  recipientFollowerCount: number;
}

export const MessageDialog = ({
  isOpen,
  onOpenChange,
  recipientId,
  recipientName,
  recipientFollowerCount,
}: MessageDialogProps) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const session = useSession();
  const navigate = useNavigate();

  const handleSendMessage = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to send messages");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      setIsSending(true);
      console.log("Sending message to:", recipientId);

      // Get current user's follower count
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('profiles')
        .select('follower_count')
        .eq('id', session.user.id)
        .single();

      if (currentUserError) throw currentUserError;

      // Determine message status based on follower counts
      const status = currentUserData.follower_count >= recipientFollowerCount 
        ? 'accepted' 
        : 'pending';

      console.log("Message status:", status, "based on follower counts:", {
        senderCount: currentUserData.follower_count,
        recipientCount: recipientFollowerCount
      });

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: session.user.id,
          recipient_id: recipientId,
          content: message.trim(),
          status
        });

      if (messageError) throw messageError;

      toast.success(
        status === 'accepted' 
          ? "Message sent! Check your messages tab." 
          : "Message request sent!"
      );
      
      setMessage("");
      onOpenChange(false);
      navigate('/messages');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message {recipientName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder={`Write a message to ${recipientName}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim()}
            >
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};