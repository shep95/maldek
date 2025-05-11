
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEncryption } from "@/providers/EncryptionProvider";
import { toast } from "sonner";
import { showTelegramToast } from "@/components/ui/telegram-toast";
import { useMessages } from "./useMessages";

export const useEncryptedMessages = () => {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { encryptText, isEncryptionInitialized } = useEncryption();
  const queryClient = useQueryClient();
  const { sendMessage } = useMessages();

  const sendEncryptedMessage = useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      try {
        // Check if encryption is initialized
        if (!isEncryptionInitialized) {
          throw new Error("Encryption not initialized. Please set up your security code first.");
        }

        setIsEncrypting(true);

        // Encrypt the message content
        const encryptedContent = await encryptText(content);
        
        if (!encryptedContent) {
          throw new Error("Failed to encrypt message");
        }

        // Send the encrypted message using the regular sendMessage function
        sendMessage({
          recipientId,
          content: encryptedContent,
          isEncrypted: true
        });

        return { success: true };
      } finally {
        setIsEncrypting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success("Encrypted message sent");
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
