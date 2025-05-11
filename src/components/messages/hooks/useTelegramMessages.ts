
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEncryption } from "@/providers/EncryptionProvider";
import { useState, useEffect } from "react";

export interface TelegramMessage {
  id: string;
  content: string;
  created_at: string;
  telegram_message_id: string | number | null;
  telegram_chat_id: string | number | null;
  is_encrypted: boolean;
  decrypted_content?: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
    follower_count: number;
  };
  recipient: {
    id: string;
    username: string;
    avatar_url: string | null;
    follower_count: number;
  };
}

export const useTelegramMessages = (currentUserId: string | null) => {
  const { decryptText, isEncryptionInitialized } = useEncryption();
  const [decryptedMessages, setDecryptedMessages] = useState<TelegramMessage[]>([]);

  const result = useQuery({
    queryKey: ['telegram_messages', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      console.log('Fetching Telegram messages for user:', currentUserId);
      
      const { data: telegramUser, error: telegramUserError } = await supabase
        .from('telegram_users')
        .select('telegram_id')
        .eq('user_id', currentUserId)
        .single();

      if (telegramUserError) {
        console.error('Error fetching Telegram user:', telegramUserError);
        return [];
      }

      if (!telegramUser) {
        console.log('No Telegram user found');
        return [];
      }

      // Make sure we're selecting all required fields
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          telegram_message_id,
          telegram_chat_id,
          sender:sender_id (
            id,
            username,
            avatar_url,
            follower_count
          ),
          recipient:recipient_id (
            id,
            username,
            avatar_url,
            follower_count
          )
        `)
        .eq('telegram_chat_id', telegramUser.telegram_id)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching Telegram messages:', messagesError);
        throw messagesError;
      }

      if (!messages || messages.length === 0) {
        return [];
      }

      // Process the messages to add is_encrypted field and ensure proper casting
      const processedMessages = messages.map(message => {
        // Ensure we have the correct object structure
        if (!message.sender || !message.recipient) {
          console.error('Message missing sender or recipient:', message);
          return null;
        }

        return {
          ...message,
          is_encrypted: typeof message.content === 'string' && message.content.includes('.') // Simple heuristic
        };
      }).filter(Boolean) as TelegramMessage[]; // Filter out any nulls and cast to TelegramMessage[]

      return processedMessages;
    },
    enabled: !!currentUserId,
  });

  // Decrypt encrypted messages when available
  useEffect(() => {
    const decryptMessages = async () => {
      if (!result.data || !isEncryptionInitialized) {
        return;
      }

      try {
        const processed = await Promise.all(
          result.data.map(async (message) => {
            // Skip if the message is not encrypted
            if (!message.is_encrypted) {
              return message;
            }

            try {
              // Try to decrypt the message content
              const decrypted = await decryptText(message.content);
              return {
                ...message,
                decrypted_content: decrypted || '🔒 [Could not decrypt message]'
              };
            } catch (error) {
              console.error('Failed to decrypt message:', error);
              return {
                ...message,
                decrypted_content: '🔒 [Could not decrypt message]'
              };
            }
          })
        );

        setDecryptedMessages(processed);
      } catch (error) {
        console.error('Error processing encrypted messages:', error);
      }
    };

    decryptMessages();
  }, [result.data, isEncryptionInitialized, decryptText]);

  return {
    ...result,
    data: decryptedMessages.length > 0 ? decryptedMessages : result.data,
    decryptedMessages,
    isDecrypting: isEncryptionInitialized && result.data && decryptedMessages.length === 0,
  };
};
