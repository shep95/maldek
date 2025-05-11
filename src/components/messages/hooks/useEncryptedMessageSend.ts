
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEncryption } from "@/providers/EncryptionProvider";
import { toast } from "sonner";

export const useEncryptedMessageSend = () => {
  const { encryptText, isEncryptionInitialized } = useEncryption();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = useMutation({
    mutationFn: async ({ 
      recipientId, 
      content,
      telegramChatId = null 
    }: { 
      recipientId: string; 
      content: string; 
      telegramChatId?: number | null;
    }) => {
      setIsProcessing(true);
      
      try {
        // Get the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        // Encrypt the message content if encryption is initialized
        let encryptedContent = null;
        if (isEncryptionInitialized && content.trim() !== '') {
          encryptedContent = await encryptText(content);
          if (!encryptedContent) {
            throw new Error('Failed to encrypt message');
          }
        }

        // Insert message with encrypted content if available
        const { error } = await supabase
          .from('messages')
          .insert({
            recipient_id: recipientId,
            sender_id: user.id,
            content: content,
            encrypted_content: encryptedContent,
            status: 'pending',
            read_at: null,
            removed_by_recipient: false,
            deleted_at: null,
            deleted_by_recipient: false,
            deleted_by_sender: false,
            is_edited: false,
            telegram_chat_id: telegramChatId
          });

        if (error) throw error;
        
        return { success: true };
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['telegram_messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    },
  });

  return {
    sendMessage: sendMessage.mutate,
    isProcessing
  };
};
