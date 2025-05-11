
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

      try {
        // Explicitly cast the response to any first to safely transform it
        const { data: messagesRaw, error: messagesError } = await supabase
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

        if (!messagesRaw || messagesRaw.length === 0) {
          return [] as TelegramMessage[];
        }

        // Validate and transform each message
        const validMessages = messagesRaw
          .filter((msg: any) => {
            // Filter out invalid messages
            if (!msg || !msg.sender || !msg.recipient) {
              console.error('Invalid message structure:', msg);
              return false;
            }
            
            // Check if sender and recipient have the required properties
            const validSender = msg.sender && 
              typeof msg.sender.id === 'string' && 
              typeof msg.sender.username === 'string';
            
            const validRecipient = msg.recipient && 
              typeof msg.recipient.id === 'string' && 
              typeof msg.recipient.username === 'string';
            
            return validSender && validRecipient;
          })
          .map((msg: any) => {
            // Transform to TelegramMessage format
            return {
              id: msg.id,
              content: msg.content,
              created_at: msg.created_at,
              telegram_message_id: msg.telegram_message_id,
              telegram_chat_id: msg.telegram_chat_id,
              is_encrypted: typeof msg.content === 'string' && msg.content.includes('.'), // Simple heuristic
              sender: {
                id: msg.sender.id,
                username: msg.sender.username,
                avatar_url: msg.sender.avatar_url,
                follower_count: msg.sender.follower_count || 0 // Provide default if missing
              },
              recipient: {
                id: msg.recipient.id,
                username: msg.recipient.username,
                avatar_url: msg.recipient.avatar_url,
                follower_count: msg.recipient.follower_count || 0 // Provide default if missing
              }
            } as TelegramMessage;
          });

        return validMessages;
      } catch (error) {
        console.error('Unexpected error processing messages:', error);
        return [] as TelegramMessage[];
      }
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
