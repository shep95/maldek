
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEncryption } from "@/providers/EncryptionProvider";
import { toast } from "sonner";
import { showTelegramToast } from "@/components/ui/telegram-toast";

export const useEncryptedMessages = () => {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { encryptText, isEncryptionInitialized } = useEncryption();
  const queryClient = useQueryClient();

  const sendEncryptedMessage = useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      try {
        // Check if encryption is initialized
        if (!isEncryptionInitialized) {
          throw new Error("Encryption not initialized. Please set up your security code first.");
        }

        // Get the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Not authenticated');
        }

        setIsEncrypting(true);

        // Encrypt the message content
        const encryptedContent = await encryptText(content);
        
        if (!encryptedContent) {
          throw new Error("Failed to encrypt message");
        }

        // Insert encrypted message
        const { error } = await supabase
          .from('messages')
          .insert({
            recipient_id: recipientId,
            sender_id: user.id,
            content: encryptedContent,
            status: 'pending',
            read_at: null,
            is_encrypted: true,
            removed_by_recipient: false,
            deleted_at: null,
            deleted_by_recipient: false,
            deleted_by_sender: false,
            is_edited: false
          });

        if (error) throw error;

        return { success: true };
      } finally {
        setIsEncrypting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['telegram_messages'] });
      toast.success("Message sent securely");
    },
    onError: (error) => {
      console.error('Error sending encrypted message:', error);
      toast.error("Failed to send encrypted message");
    },
  });

  // Function to show an encrypted message notification
  const showEncryptedMessageNotification = (sender: string, avatar?: string) => {
    showTelegramToast({
      title: sender,
      message: "🔒 Encrypted message received",
      avatar
    });
  };

  return {
    sendEncryptedMessage: sendEncryptedMessage.mutate,
    isEncrypting,
    isEncryptionInitialized,
    showEncryptedMessageNotification
  };
};
